use chrono::{prelude::*, Duration};
use diesel::prelude::*;

use crate::{
	db::{DbConn, DbResult},
	models::{
		account::User,
		schema::{
			git_lfs_download_token as download_token, git_lfs_object as object, git_lfs_repository as repository,
			git_lfs_upload_token as upload_token, user,
		},
	},
	util,
};

#[derive(Clone, Queryable, Identifiable, Associations)]
#[belongs_to(User, foreign_key = "owner")]
#[table_name = "repository"]
pub struct Repository {
	id:        i32,
	pub owner: i32,
	pub name:  String,
}
impl Repository {
	pub fn get(conn: &DbConn, owner: &str, name: &str) -> DbResult<Option<Repository>> {
		let user = user::table.filter(user::name.eq(owner)).first::<User>(conn)?;

		Repository::belonging_to(&user).filter(repository::name.eq(name)).first(conn).optional()
	}

	pub fn get_object(&self, conn: &DbConn, oid: &str) -> DbResult<Option<Object>> {
		let ret =
			object::table.filter(object::repository.eq(&self.id)).filter(object::oid.eq(oid)).first(conn).optional();
		debug!("git lfs: get_object({}) = {:?}", oid, ret);
		ret
	}

	pub fn create_object(&self, conn: &DbConn, oid: &str, size: i64) -> DbResult<Object> {
		debug!("git lfs: create_object({}, {})", oid, size);
		NewObject { oid, size, valid: false, repository: self.id }.insert_into(object::table).execute(conn)?;
		object::table.filter(object::repository.eq(&self.id)).filter(object::oid.eq(oid)).first(conn)
	}

	pub fn get_owner(&self, conn: &DbConn) -> DbResult<User> { user::table.filter(user::id.eq(self.owner)).first(conn) }
}

#[derive(Insertable)]
#[table_name = "object"]
struct NewObject<'a> {
	oid:        &'a str,
	size:       i64,
	valid:      bool,
	repository: i32,
}

#[derive(Clone, Debug, Queryable, Identifiable)]
#[table_name = "object"]
pub struct Object {
	pub id:         i32,
	pub oid:        String,
	pub size:       i64,
	pub valid:      bool,
	pub repository: i32,
}
impl Object {
	/// Gets the repository associated with the object
	pub fn get_repository(&self, conn: &DbConn) -> DbResult<Repository> {
		repository::table.filter(repository::id.eq(self.repository)).first(conn)
	}

	/// Makes the object valid, and saves the changes of the object to the database
	pub fn make_valid(&self, conn: &DbConn) -> DbResult<()> {
		diesel::update(self).set(object::valid.eq(true)).execute(conn).map(|_| ())
	}
}

#[derive(Insertable)]
#[table_name = "upload_token"]
struct NewUploadToken<'a> {
	token:   &'a str,
	object:  i32,
	expires: NaiveDateTime,
}

pub const UPLOAD_TOKEN_EXPIRATION_SECONDS: u32 = 5 * 60;

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "upload_token"]
#[primary_key(token)]
pub struct UploadToken {
	pub token:   String,
	pub object:  i32,
	pub expires: NaiveDateTime,
}
impl UploadToken {
	/// Create a new upload token for the specified object
	pub fn new(conn: &DbConn, object: &Object) -> DbResult<UploadToken> {
		let now = Utc::now();
		UploadToken::clean_table(conn, now)?;

		// Add new upload token
		let expires = (now + Duration::seconds(UPLOAD_TOKEN_EXPIRATION_SECONDS as i64)).naive_utc();
		let token: String = util::random_token();
		NewUploadToken { token: &token, object: object.id, expires }.insert_into(upload_token::table).execute(conn)?;
		Ok(UploadToken { token, object: object.id, expires })
	}

	/// Get the upload token with the specified id
	pub fn get(conn: &DbConn, token: &str) -> DbResult<Option<UploadToken>> {
		let now = Utc::now();
		UploadToken::clean_table(conn, now)?;

		upload_token::table.filter(upload_token::token.eq(token)).first(conn).optional()
	}

	/// Removes old entries from upload token database
	fn clean_table(conn: &DbConn, now: DateTime<Utc>) -> DbResult<usize> {
		diesel::delete(upload_token::table.filter(upload_token::expires.lt(&now.naive_utc()))).execute(conn)
	}

	/// Gets the object associated with the token
	pub fn get_object(&self, conn: &DbConn) -> DbResult<Object> {
		object::table.filter(object::id.eq(self.object)).first(conn)
	}
}

pub const DOWNLOAD_TOKEN_EXPIRATION_SECONDS: u32 = 5 * 60;

#[derive(Insertable)]
#[table_name = "download_token"]
struct NewDownloadToken<'a> {
	token:   &'a str,
	object:  i32,
	expires: NaiveDateTime,
}

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "download_token"]
#[primary_key(token)]
pub struct DownloadToken {
	pub token:   String,
	pub object:  i32,
	pub expires: NaiveDateTime,
}
impl DownloadToken {
	/// Create a new download token for the specified object
	pub fn new(conn: &DbConn, object: &Object) -> DbResult<DownloadToken> {
		let now = Utc::now();
		DownloadToken::clean_table(conn, now)?;

		// Add new download token
		let expires = (now + Duration::seconds(UPLOAD_TOKEN_EXPIRATION_SECONDS as i64)).naive_utc();
		let token: String = util::random_token();
		NewDownloadToken { token: &token, object: object.id, expires }
			.insert_into(download_token::table)
			.execute(conn)?;
		Ok(DownloadToken { token, object: object.id, expires })
	}

	/// Get the download token with the specified id
	pub fn get(conn: &DbConn, token: &str) -> DbResult<Option<DownloadToken>> {
		let now = Utc::now();
		DownloadToken::clean_table(conn, now)?;

		download_token::table.filter(download_token::token.eq(token)).first(conn).optional()
	}

	/// Removes old entries from download token database
	fn clean_table(conn: &DbConn, now: DateTime<Utc>) -> DbResult<usize> {
		diesel::delete(download_token::table.filter(download_token::expires.lt(&now.naive_utc()))).execute(conn)
	}

	/// Gets the object associated with the token
	pub fn get_object(&self, conn: &DbConn) -> DbResult<Object> {
		object::table.filter(object::id.eq(self.object)).first(conn)
	}
}
