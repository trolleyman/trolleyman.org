#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate anyhow;

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;

#[macro_use] extern crate diesel;
#[macro_use] extern crate diesel_migrations;

#[macro_use] extern crate lazy_static;

#[macro_use] extern crate serde_json;
#[macro_use] extern crate log;

use std::collections::{BTreeMap, HashMap};

use diesel::prelude::*;
use rocket::config::Environment;
use rocket_contrib::{
	serve::StaticFiles,
	templates::{tera, Template},
};

mod app;
mod config;
mod db;
mod error;
mod models;
mod schema;
mod util;

embed_migrations!();

use config::Config;
use error::Result;

#[catch(400)]
fn error_handler_400_bad_request(_req: &rocket::Request) -> Template {
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
fn error_handler_404_not_found(req: &rocket::Request) -> Template {
	Template::render(
		"error",
		json!({
			"status": "404",
			"title": "Not Found",
			"msg": format!("'{}' could not be found.", req.uri().path()),
		}),
	)
}

fn get_configs() -> Result<(Config, rocket::Config, simplelog::Config)> {
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

	// Get simple log config
	let mut log_config_builder = simplelog::ConfigBuilder::new();
	log_config_builder.set_target_level(simplelog::LevelFilter::Error);
	let simplelog_config = if active_env.is_dev() {
		log_config_builder.set_time_to_local(true).set_time_format_str("%k:%M:%S.%3f").build()
	} else {
		log_config_builder.set_time_format_str("%Y-%m-%d %H:%M:%S.%9f").build()
	};

	Ok((config, rocket_config, simplelog_config))
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
					warn!("Retried too many times, exiting");
					return Err(e).context(format!("Failed to open database connection ({})", db_url));
				}

				warn!("Failed to open database connection ({}): {}", db_url, e);

				std::thread::sleep(std::time::Duration::from_secs(1));
			}
		}
	};

	// Migrate database
	embedded_migrations::run_with_output(&db_conn, &mut std::io::stdout()).context("Failed to migrate database")
}

fn setup_logging(config: &Config, log_config: &simplelog::Config) -> Result<()> {
	use simplelog::{CombinedLogger, LevelFilter, SharedLogger, SimpleLogger, TermLogger, TerminalMode, WriteLogger};
	use std::fs::OpenOptions;

	let mut warn_msgs = vec![];
	let mut loggers: Vec<Box<dyn SharedLogger>> = vec![];

	// Terminal logger
	match TermLogger::new(LevelFilter::Info, log_config.clone(), TerminalMode::Mixed) {
		Some(l) => loggers.push(l),
		None => {
			loggers.push(SimpleLogger::new(LevelFilter::Info, log_config.clone()));
			warn_msgs.push("Terminal logger could not be initialized".to_string());
		}
	}

	// Log file
	if let Some(parent) = config.log_path.parent() {
		if let Err(e) = std::fs::create_dir_all(&parent) {
			warn_msgs.push(format!("Log file directory could not be created: {}: {}", parent.display(), e));
		}
	}
	match OpenOptions::new().create(true).append(true).open(&config.log_path) {
		Ok(file) => loggers.push(WriteLogger::new(LevelFilter::Debug, log_config.clone(), file)),
		Err(e) => warn_msgs.push(format!("Log file path could not be opened: {}: {}", &config.log_path.display(), e)),
	}

	// Combined final logger
	let ret = CombinedLogger::init(loggers).context("Failed to init combined logger");

	if ret.is_ok() {
		for warn_msg in warn_msgs.iter() {
			warn!("{}", warn_msg);
		}
	}
	ret
}

pub fn main() -> Result<()> {
	// Load configs
	let (config, rocket_config, simplelog_config) = get_configs()?;

	setup_logging(&config, &simplelog_config)?;

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
		.attach(db::DbConn::fairing())
		.manage(active_env)
		.manage(config)
		.register(catchers![error_handler_400_bad_request, error_handler_404_not_found])
		.mount("/static", StaticFiles::from("./static"))
		.mount("/", app::root::routes())
		.mount("/account", app::account::routes())
		.mount("/facebook", app::facebook::routes())
		.mount("/flappy", app::flappy::routes())
		.mount("/git_hook", app::github::routes())
		.mount("/git-lfs", app::git_lfs::routes())
		.mount("/linc", app::linc::routes())
		.mount("/tanks", app::tanks::routes())
		.launch();
	Ok(())
}
