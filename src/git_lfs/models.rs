use chrono::prelude::*;
use chrono::Duration;
use diesel::prelude::*;
use rand::Rng;

use crate::{
	schema::{git_lfs_object as object, git_lfs_repository as repository, git_lfs_upload_token as upload_token},
	DbConn, DbResult
};

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "repository"]
pub struct Repository {
	pub id:    i32,
	pub owner: String,
	pub name:  String,
}
impl Repository {
	pub fn get(conn: &DbConn, owner: &str, name: &str) -> DbResult<Option<Repository>> {
		repository::table
			.filter(repository::owner.eq(owner))
			.filter(repository::name.eq(name))
			.first(&**conn)
			.optional()
	}

	pub fn get_object(&self, conn: &DbConn, oid: &str) -> DbResult<Option<Object>> {
		object::table.filter(object::repository.eq(&self.id)).filter(object::oid.eq(oid)).first(&**conn).optional()
	}

	pub fn create_object(&self, conn: &DbConn, oid: &str, size: i64) -> DbResult<Object> {
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

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "object"]
pub struct Object {
	pub id:         i32,
	pub oid:        String,
	pub size:       i64,
	pub repository: i32,
}
impl Object {
	/// Gets the repository associated with the object
	pub fn get_repository(&self, conn: &DbConn) -> DbResult<Repository> {
		repository::table
			.filter(repository::id.eq(self.repository))
			.first(&**conn)
	}
}

#[derive(Insertable)]
#[table_name = "upload_token"]
struct NewUploadToken<'a> {
	token:      &'a str,
	object:     i32,
	expires:    NaiveDateTime,
}

pub const UPLOAD_TOKEN_EXPIRATION_SECONDS: u32 = 5 * 60;

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "upload_token"]
#[primary_key(token)]
pub struct UploadToken {
	pub token:      String,
	pub object:     i32,
	pub expires:    NaiveDateTime,
}
impl UploadToken {
	/// Create a new upload token for the specified object
	pub fn new(conn: &DbConn, object: &Object) -> DbResult<UploadToken> {
		let now = Utc::now();
		UploadToken::clean_table(conn, now);
		
		// Add new upload token
		let expires = (now + Duration::seconds(UPLOAD_TOKEN_EXPIRATION_SECONDS as i64)).naive_utc();
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

	/// Get the upload token with the specified id
	pub fn get(conn: &DbConn, token: &str) -> DbResult<Option<UploadToken>> {
		let now = Utc::now();
		UploadToken::clean_table(conn, now);

		upload_token::table
			.filter(upload_token::token.eq(token))
			.first(&**conn)
			.optional()
	}

	/// Removes old entries from upload token database
	fn clean_table(conn: &DbConn, now: DateTime<Utc>) -> DbResult<usize> {
		diesel::delete(upload_token::table.filter(upload_token::expires.lt(&now.naive_utc())))
			.execute(&**conn)
	}

	/// Gets the object associated with the token
	pub fn get_object(&self, conn: &DbConn) -> DbResult<Object> {
		object::table
			.filter(object::id.eq(self.object))
			.first(&**conn)
	}
}
