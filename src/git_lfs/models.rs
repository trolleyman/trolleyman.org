use chrono::prelude::*;
use diesel::prelude::*;

use crate::{
	schema::{git_lfs_object as object, git_lfs_repository as repository, git_lfs_upload_token as upload_token},
	DbConn,
};

#[derive(Queryable, Identifiable)]
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
	
	pub fn create_object(&self, conn: &DbConn, oid: &str, size: u64) -> Result<Object, diesel::result::Error> {
		NewObject { oid, size }.insert_into(object::table).get_result(&**conn)
	}
}

#[derive(Insertable)]
#[table_name = "object"]
struct NewObject<'a> {
	oid: &'a str,
	size: u64,
}

#[derive(Queryable, Identifiable)]
#[table_name = "object"]
pub struct Object {
	id:         i32,
	oid:        String,
	size:       u64,
	repository: i32,
}

#[derive(Queryable, Identifiable)]
#[table_name = "upload_token"]
pub struct UploadToken {
	id: i32,
	token: String,
	repository: i32,
	object: i32,
	expires: DateTime<Utc>,
}
impl UploadToken {
	pub fn new(conn: &DbConn, object: &Object) -> UploadToken {
		todo!()
	}
}
