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

pub fn setup(config: &Config) -> Result<DbConn> {
	let db_url = config.database_path.to_string_lossy().to_string();
	let conn = util::retry::until_timeout(Duration::from_secs(60), &format!("Failed to open database {}", db_url), || {
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
