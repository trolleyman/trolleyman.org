use std::time::Duration;

use anyhow::Context;
use diesel::prelude::*;

use crate::{config::Config, error::Result, util};

pub type DbError = diesel::result::Error;
pub type DbResult<T> = Result<T, DbError>;

pub type DbConn = diesel::SqliteConnection;

#[database("db")]
pub struct DbConnGuard(DbConn);

embed_migrations!();

const EMPTY_DATABASE: &'static [u8] = include_bytes!("empty_db.sqlite3");

pub fn setup(config: &Config) -> Result<DbConn> {
	// If it doesn't exist, wait for a bit, then create an empty database
	if !config.database.path.exists() {
		std::thread::sleep(Duration::from_secs(1));
		if !config.database.path.exists() {
			if let Some(parent) = config.database.path.parent() {
				if !parent.is_dir() {
					std::fs::create_dir_all(parent)?;
				}
			}
			std::fs::write(&config.database.path, EMPTY_DATABASE)?;
		}
	}

	// Connect to database
	let db_url = config.database.path.to_string_lossy().to_string();
	let conn =
		util::retry::until_timeout(config.database.timeout, &format!("Failed to open database {}", db_url), || {
			DbConn::establish(&db_url)
				.context(format!("Failed to open database connection ({})", db_url))
				.map_err(From::from)
		})?;
	info!("Connected to database at {}", db_url);

	// Migrate database
	info!("Running database migrations...");
	embedded_migrations::run_with_output(&conn, &mut std::io::stdout()).context("Failed to migrate database")?;
	info!("Completed database migrations");
	Ok(conn)
}
