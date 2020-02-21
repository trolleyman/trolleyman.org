use chrono::prelude::*;
use chrono::Duration;
use diesel::prelude::*;
use rand::Rng;

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
		object::table.filter(object::repository.eq(&self.id)).filter(object::oid.eq(oid)).first(&**conn).optional()
	}

	pub fn create_object(&self, conn: &DbConn, oid: &str, size: i64) -> Result<Object, diesel::result::Error> {
		NewObject { oid, size, repository: self.id }.insert_into(object::table).execute(&**conn)?;
		object::table.filter(object::repository.eq(&self.id)).filter(object::oid.eq(oid)).first(&**conn)
	}
}

#[derive(Insertable)]
#[table_name = "object"]
struct NewObject<'a> {
	oid:        &'a str,
	size:       i64,
	repository: i32,
}

#[derive(Queryable, Identifiable)]
#[table_name = "object"]
pub struct Object {
	id:         i32,
	oid:        String,
	size:       i64,
	repository: i32,
}

#[derive(Insertable)]
#[table_name = "upload_token"]
struct NewUploadToken<'a> {
	token:      &'a str,
	object:     i32,
	expires:    NaiveDateTime,
}

#[derive(Queryable, Identifiable)]
#[table_name = "upload_token"]
#[primary_key(token)]
pub struct UploadToken {
	token:      String,
	object:     i32,
	expires:    NaiveDateTime,
}
impl UploadToken {
	pub fn new(conn: &DbConn, object: &Object) -> Result<UploadToken, diesel::result::Error> {
		// Remove old entries from upload token database
		let now = Utc::now();
		diesel::delete(upload_token::table.filter(upload_token::expires.lt(&now.naive_utc())))
			.execute(&**conn)?;
		
		// Add new upload token
		let expires = (now + Duration::minutes(5)).naive_utc();
		let token: String = rand::thread_rng()
			.sample_iter(&rand::distributions::Alphanumeric)
			.take(30)
			.collect();
		NewUploadToken {
			token: &token,
			object: object.id,
			expires,
		}.insert_into(upload_token::table).execute(&**conn)?;
		Ok(UploadToken {
			token,
			object: object.id,
			expires,
		})
	}
}
