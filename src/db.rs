use anyhow::Context;
use diesel::prelude::*;

use crate::{config::Config, error::Result};

pub type DbError = diesel::result::Error;
pub type DbResult<T> = Result<T, DbError>;

pub type DbConn = diesel::SqliteConnection;

#[database("db")]
pub struct DbConnGuard(DbConn);

embed_migrations!();

pub fn setup(config: &Config) -> Result<DbConn> {
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
	embedded_migrations::run_with_output(&conn, &mut std::io::stdout()).context("Failed to migrate database")?;
	Ok(conn)
}
