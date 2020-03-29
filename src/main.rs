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

use anyhow::Context;
use clap::{App, AppSettings, Arg, SubCommand};
use diesel::prelude::*;
use rocket::config::Environment;
use rocket_contrib::{
	serve::StaticFiles,
	templates::{tera, Template},
};
use serde_json::Value as JsonValue;

mod app;
mod config;
mod db;
mod error;
mod models;
mod util;

embed_migrations!();

use config::Config;
use error::Result;
use db::DbConn;

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

fn setup_database(config: &Config) -> Result<DbConn> {
	let db_url = config.database_path.to_string_lossy().to_string();
	let start_time = std::time::Instant::now();
	let conn = loop {
		match DbConn::establish(&db_url) {
			Ok(conn) => break conn,
			Err(e) => {
				let now = std::time::Instant::now();
				if now - start_time > std::time::Duration::from_secs(60) {
					// > 1 min waiting, exit
					warn!("Retried too many times, exiting");
					return Err(e)
						.context(format!("Failed to open database connection ({})", db_url))
						.map_err(From::from);
				}

				warn!("Failed to open database connection ({}): {}", db_url, e);

				std::thread::sleep(std::time::Duration::from_secs(1));
			}
		}
	};

	// Migrate database
	embedded_migrations::run_with_output(&conn, &mut std::io::stdout())
		.context("Failed to migrate database")?;
	Ok(conn)
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
	let ret = CombinedLogger::init(loggers).context("Failed to init combined logger").map_err(From::from);

	if ret.is_ok() {
		for warn_msg in warn_msgs.iter() {
			warn!("{}", warn_msg);
		}
	}
	ret
}

fn perform_command(conn: &SqliteConnection, matches: &clap::ArgMatches<'_>) -> Result<bool> {
	if let Some(submatches) =  matches.subcommand_matches("set-password") {
		let username = submatches.value_of("username").ok_or(anyhow!("Username not specified"))?;
		info!("Getting password for {}.", username);
		let password = loop {
			let password = rpassword::prompt_password_stderr("Password: ")?;
			let errors = app::account::validation::get_errors_for_password(&password);
			if errors.len() > 0 {
				println!("Password breaks rule{}:", if errors.len() == 1 { "" } else { "s" });
				for error in errors {
					println!("\t- {}", error);
				}
				let reply = rprompt::prompt_reply_stderr("Force? y/n ")?;
				if reply.to_lowercase() != "y" {
					continue;
				}
			}
			break password;
		};
		
		// Set password & exit
		crate::models::account::User::set_password(&conn, &username, &password)?;
		info!("Password updated for {}.", username);
		Ok(true)
	} else if let Some(submatches) =  matches.subcommand_matches("set-email") {
		let username = submatches.value_of("username").ok_or(anyhow!("Username not specified"))?;
		let email = submatches.value_of("email").ok_or(anyhow!("Email not specified"))?;

		let errors = app::account::validation::get_errors_for_email(conn, &email)?;
		if errors.len() > 0 {
			println!("Email address breaks rule{}:", if errors.len() == 1 { "" } else { "s" });
			for error in errors {
				println!("\t- {}", error);
			}
			let reply = rprompt::prompt_reply_stderr("Force? y/n ")?;
			if reply.to_lowercase() != "y" {
				info!("Email address not updated for {}", username);
				return Ok(true);
			}
		}
		
		// Set email address & exit
		crate::models::account::User::set_email(&conn, &username, &email)?;
		info!("Email address updated for {} to {}.", username, email);
		Ok(true)
	} else {
		Ok(false)
	}
}

pub fn main() -> Result<()> {
	// Get app args
	let authors_string = env!("CARGO_PKG_AUTHORS").split(';').collect::<Vec<_>>().join(", ");
	let app = App::new(clap::crate_name!())
		.version(clap::crate_version!())
		.about(clap::crate_description!())
		.author(authors_string.as_ref())
		.setting(AppSettings::ColoredHelp)
		.setting(AppSettings::GlobalVersion)
		.setting(AppSettings::VersionlessSubcommands)
		.subcommand(
			SubCommand::with_name("set-password")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Set the password of a specified user")
				.arg(Arg::with_name("username").required(true)),
		)
		.subcommand(
			SubCommand::with_name("set-email")
				.setting(AppSettings::DisableHelpSubcommand)
				.about("Set the email address of a specified user")
				.arg(Arg::with_name("username").required(true))
				.arg(Arg::with_name("email").required(true)),
		);

	let matches = app.get_matches();

	// Load configs
	let (config, rocket_config, simplelog_config) = get_configs()?;

	setup_logging(&config, &simplelog_config)?;

	let conn = setup_database(&config)?;

	if perform_command(&conn, &matches)? {
		return Ok(());
	}
	
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
			f.tera.register_filter("escape_data", move |value: &JsonValue, args: &HashMap<_, _>| {
				if !args.is_empty() {
					Err(tera::Error::msg("escape_data called with arguments (expected none)"))
				} else {
					Ok(JsonValue::String(tera::escape_html(&match value {
						JsonValue::Null => "".into(),
						JsonValue::Bool(b) => format!("{}", b),
						JsonValue::Number(num) => format!("{}", num),
						JsonValue::String(s) => s.clone(),
						JsonValue::Array(_) => format!("{}", value),
						JsonValue::Object(_) => format!("{}", value),
					})))
				}
			});
		}))
		.attach(db::DbConnGuard::fairing())
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
