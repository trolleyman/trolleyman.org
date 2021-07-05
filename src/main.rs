#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate anyhow;

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;

#[macro_use] extern crate diesel;
#[macro_use] extern crate diesel_migrations;

#[macro_use] extern crate lazy_static;

#[macro_use] extern crate serde_json;
#[macro_use] extern crate log;

use std::collections::HashMap;

use rocket_contrib::{
	serve::StaticFiles,
	templates::{tera, Template},
};
use serde_json::Value as JsonValue;

mod app;
mod cli;
mod config;
mod db;
mod error;
mod logging;
mod models;
mod util;

use error::Result;

pub fn main() -> Result<()> { std::process::exit(run()?) }

pub fn run() -> Result<i32> {
	// Find OpenSSL certs properly on Linux
	openssl_probe::init_ssl_cert_env_vars();

	// Parse command line args
	let matches = cli::get_matches();

	// Load configs
	let (config, rocket_config, simplelog_config) = config::get_configs()?;
	logging::setup(&config, &simplelog_config)?;

	// Handle command if specified by args & exit if necessary
	match cli::perform_command(&config, &matches)? {
		Some(code) => return Ok(code),
		None => {}
	}

	// Setup database
	let conn = db::setup(&config)?;

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
		.register(app::error::catchers())
		.mount("/static", StaticFiles::from("./static"))
		.mount("/", app::root::routes())
		.mount("/account", app::account::routes())
		.mount("/flappy", app::flappy::routes())
		.mount("/git_hook", app::github::routes())
		.mount("/git-lfs", app::git_lfs::routes())
		.mount("/linc", app::linc::routes())
		.mount("/tanks", app::tanks::routes())
		.launch();
	Ok(0)
}
