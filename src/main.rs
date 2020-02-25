#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate anyhow;

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;

#[macro_use] extern crate diesel;
#[macro_use] extern crate diesel_migrations;

#[macro_use] extern crate serde_json;

use std::collections::{BTreeMap, HashMap};

use anyhow::{Context, Result};
use diesel::prelude::*;
use rocket::{config::Environment, State};
use rocket_contrib::{
	serve::StaticFiles,
	templates::{self, tera, Template},
};

use rand::Rng;

mod schema;

mod config;
mod db;
mod recaptcha;

mod flappy;
mod git_lfs;
mod github;
mod linc;
mod tanks;

pub const WARN_PREFIX: &'static str = "\x1B[1m\x1B[33mwarn\x1B[37m:\x1B[0m ";
pub const ERROR_PREFIX: &'static str = "\x1B[1m\x1B[31merror\x1B[37m:\x1B[0m ";

pub use db::{DbConn, DbError, DbResult};

embed_migrations!();

use config::Config;
use recaptcha::ReCaptchaGuard;

#[get("/heartbeat")]
fn heartbeat() -> String { "A-ok!".to_string() }

#[get("/")]
fn index(config: State<Config>) -> Template {
	let num_bg = 16;
	let i = rand::thread_rng().gen_range(0, num_bg) + 1;

	Template::render(
		"index",
		json!({
			"bg_url": format!("/static/img/bg/{:02}.jpg", i),
			"sitekey": config.recaptcha.public_key.clone(),
		}),
	)
}

#[get("/contact_details")]
fn contact_details(_recaptcha: ReCaptchaGuard) -> Template { Template::render("contact_details", json!({})) }

#[get("/projects/<project_name>")]
fn project(project_name: String, metadata: templates::Metadata) -> Option<Template> {
	let template_name = format!("projects/{}", project_name);
	if project_name.starts_with('_') || !metadata.contains_template(&template_name) {
		None
	} else {
		Some(Template::render(
			template_name,
			json!({
				"project_name": project_name,
			}),
		))
	}
}

#[catch(400)]
fn error_400_bad_request(_req: &rocket::Request) -> Template {
	Template::render(
		"error",
		json!({
			"status": "400",
			"title": "Bad Request",
			"msg": "Client sent a bad request.",
		}),
	)
}

#[catch(404)]
fn error_404_not_found(req: &rocket::Request) -> Template {
	Template::render(
		"error",
		json!({
			"status": "404",
			"title": "Not Found",
			"msg": format!("'{}' could not be found.", req.uri().path()),
		}),
	)
}

fn get_configs() -> Result<(Config, rocket::Config)> {
	use rocket::config::Value;

	// Load config, based on environment
	let active_env = Environment::active().context("Invalid environment config")?;
	let config = Config::load(active_env).context("Failed to load config")?;

	// Setup db tables
	let db_url = config.database_path.to_string_lossy().to_string();
	let mut config_db_table = BTreeMap::<String, rocket::config::Value>::new();
	config_db_table.insert("url".into(), Value::String(db_url));
	let mut config_databases_db_table = BTreeMap::<String, rocket::config::Value>::new();
	config_databases_db_table.insert("db".into(), Value::Table(config_db_table));

	// Get default Rocket config
	let rocket_config = {
		let mut builder = rocket::Config::build(active_env)
			.log_level(rocket::logger::LoggingLevel::Normal)
			.extra("databases", Value::Table(config_databases_db_table));
		if let Some(secret_key) = &config.secret_key {
			builder = builder.secret_key(secret_key);
		}
		builder.finalize().context("Rocket config failed to parse")?
	};
	Ok((config, rocket_config))
}

fn setup_database(config: &Config) -> Result<()> {
	let db_url = config.database_path.to_string_lossy().to_string();
	let start_time = std::time::Instant::now();
	let db_conn = loop {
		match diesel::sqlite::SqliteConnection::establish(&db_url) {
			Ok(db_conn) => break db_conn,
			Err(e) => {
				let now = std::time::Instant::now();
				if now - start_time > std::time::Duration::from_secs(60) {
					// > 1 min waiting, exit
					eprintln!("{}Retried too many times, exiting", WARN_PREFIX);
					return Err(e).context(format!("Failed to open database connection ({})", db_url));
				}

				eprintln!("{}Failed to open database connection ({}): {}", WARN_PREFIX, db_url, e);

				std::thread::sleep(std::time::Duration::from_secs(1));
			}
		}
	};

	// Migrate database
	embedded_migrations::run_with_output(&db_conn, &mut std::io::stdout()).context("Failed to migrate database")
}

pub fn main() -> Result<()> {
	// Load configs
	let (config, rocket_config) = get_configs()?;

	setup_database(&config)?;

	// Launch Rocket
	let active_env = rocket_config.environment;
	rocket::custom(rocket_config)
		.attach(Template::custom(move |f| {
			f.tera.register_function("dot_min", move |args: &HashMap<_, _>| {
				if !args.is_empty() {
					Err(tera::Error::msg("dot_min called with arguments (expected none)"))
				} else {
					if active_env.is_prod() {
						Ok(json!(".min"))
					} else {
						Ok(json!(""))
					}
				}
			});
			f.tera.register_function("is_debug", move |args: &HashMap<_, _>| {
				if !args.is_empty() {
					Err(tera::Error::msg("dot_min called with arguments (expected none)"))
				} else {
					Ok(json!(!active_env.is_prod()))
				}
			});
		}))
		.attach(DbConn::fairing())
		.manage(config)
		.register(catchers![error_400_bad_request, error_404_not_found])
		.mount("/", routes![heartbeat, index, contact_details, project])
		.mount("/static", StaticFiles::from("./static"))
		.mount("/flappy", flappy::routes())
		.mount("/linc", linc::routes())
		.mount("/tanks", tanks::routes())
		.mount("/git_hook", github::routes())
		.mount("/git-lfs", git_lfs::routes())
		.launch();
	Ok(())
}
