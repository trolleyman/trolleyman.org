use diesel::prelude::*;
use serde::Serialize;

use crate::{schema::git_lfs_repository as repository, schema::git_lfs_object as object, DbConn};

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "repository"]
pub struct Repository {
	id:    i32,
	owner: String,
	name:  String,
}
impl Repository {
	pub fn get(conn: &DbConn, owner: &str, name: &str) -> Result<Option<Repository>, diesel::result::Error> {
		repository::table
			.filter(repository::owner.eq(owner))
			.filter(repository::name.eq(name))
			.first(&**conn)
			.optional()
	}

	pub fn get_object(&self, conn: &DbConn, oid: &str) -> Result<Option<Object>, diesel::result::Error> {
		object::table
			.filter(object::repository.eq(&self.id))
			.filter(object::oid.eq(oid))
			.first(&**conn)
			.optional()
	}
}

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "object"]
pub struct Object {
	id: i32,
	oid: String,
	size: i32,
	repository: i32,
}
