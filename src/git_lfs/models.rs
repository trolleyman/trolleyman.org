use diesel::prelude::*;
use serde::Serialize;

use crate::{schema::git_lfs_repository as repository, DbConn};

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "repository"]
pub struct Repository {
	id:    i32,
	owner: String,
	name:  String,
}
impl Repository {
	pub fn get(conn: DbConn, owner: &str, name: &str) -> Result<Option<Repository>, diesel::result::Error> {
		repository::table.filter(repository::owner.eq(owner)).filter(repository::name.eq(name)).first(&*conn).optional()
	}
}
