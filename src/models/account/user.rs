use chrono::prelude::*;
use diesel::prelude::*;

use crate::{
	db::{DbConn, DbResult},
	models::schema::{session_token, user},
	util,
};

pub use super::{password::Password, SessionToken};
use std::time::Duration;

#[derive(Insertable)]
#[table_name = "session_token"]
struct NewSessionToken<'a> {
	pub token:   &'a str,
	pub user:    i32,
	pub expires: NaiveDateTime,
}

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "user"]
pub struct User {
	pub id:       i32,
	pub name:     String,
	pub email:    String,
	pub password: Password,
	pub created:  NaiveDateTime,
	pub admin:    bool,
}
impl User {
	pub fn exists_with_name(conn: &DbConn, name: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::name.eq(name)))).get_result(&**conn)
	}

	pub fn exists_with_email(conn: &DbConn, email: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::email.eq(email)))).get_result(&**conn)
	}

	pub fn get_with_username_or_email(conn: &DbConn, username_email: &str) -> DbResult<Option<User>> {
		if username_email.contains('@') {
			user::table.filter(user::email.eq(username_email)).first(&**conn).optional()
		} else {
			user::table.filter(user::name.eq(username_email)).first(&**conn).optional()
		}
	}

	/// Creates a new session token for the user given.
	///
	/// If the password given does not match the password in the database, then `Ok(None)` is returned.
	pub fn new_session_token(&self, conn: &DbConn, password: &str, expires: Duration) -> DbResult<Option<String>> {
		if !self.password.matches(password) {
			return Ok(None);
		}

		let token = util::random_token();
		let expires = (Utc::now() + chrono::Duration::from_std(expires).unwrap_or(chrono::Duration::max_value())).naive_utc();
		NewSessionToken { token: &token, user: self.id, expires }.insert_into(session_token::table).execute(&**conn)?;
		Ok(Some(token))
	}
}
