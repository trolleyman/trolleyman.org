use chrono::prelude::*;
use diesel::prelude::*;

use crate::{
	db::{DbConn, DbConnGuard, DbResult},
	error::{Error, Result},
	models::{
		account::{Password, SessionToken},
		schema::{session_token, user},
	},
	util,
};

use rocket::{
	http::Status,
	request::{self, FromRequest},
	Request,
};
use std::time::Duration;

#[derive(Insertable)]
#[table_name = "session_token"]
struct NewSessionToken<'a> {
	pub token:   &'a str,
	pub user:    i32,
	pub expires: NaiveDateTime,
}

#[derive(Insertable)]
#[table_name = "user"]
struct NewUser<'a> {
	pub name:     &'a str,
	pub email:    &'a str,
	pub password: &'a Password,
	pub admin:    bool,
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
	pub fn create(conn: &DbConn, name: &str, email: &str, password: &Password, admin: bool) -> DbResult<User> {
		let new_user = NewUser { name, email, password, admin };
		new_user.insert_into(user::table).execute(conn)?;
		user::table.filter(user::name.eq(name)).filter(user::email.eq(email)).first(conn)
	}

	pub fn exists_with_name(conn: &DbConn, name: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::name.eq(name)))).get_result(conn)
	}

	pub fn exists_with_email(conn: &DbConn, email: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::email.eq(email)))).get_result(conn)
	}

	pub fn get_from_token(conn: &DbConn, token: &str) -> DbResult<Option<User>> {
		if let Some(token) = SessionToken::get_unexpired(conn, token)? {
			user::table.filter(user::id.eq(token.user)).get_result(conn).optional()
		} else {
			Ok(None)
		}
	}

	pub fn get_with_name(conn: &DbConn, username: &str) -> DbResult<Option<User>> {
		user::table.filter(user::name.eq(username)).first(conn).optional()
	}

	pub fn get_with_email(conn: &DbConn, email: &str) -> DbResult<Option<User>> {
		user::table.filter(user::email.eq(email)).first(conn).optional()
	}

	pub fn get_with_username_or_email(conn: &DbConn, username_email: &str) -> DbResult<Option<User>> {
		if username_email.contains('@') {
			User::get_with_email(conn, username_email)
		} else {
			User::get_with_name(conn, username_email)
		}
	}

	// Errors if the user could not be found, or if there was a database error
	pub fn set_password(conn: &DbConn, username: &str, password: &str) -> Result<()> {
		if let Some(user) = User::get_with_username_or_email(conn, username)? {
			let password = Password::from_password(password);
			diesel::update(user::table.filter(user::id.eq(user.id))).set(user::password.eq(password)).execute(conn)?;
			Ok(())
		} else {
			Err(Error::NotFound("The user was not found".into()))
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
		let expires =
			(Utc::now() + chrono::Duration::from_std(expires).unwrap_or(chrono::Duration::max_value())).naive_utc();
		NewSessionToken { token: &token, user: self.id, expires }.insert_into(session_token::table).execute(conn)?;
		Ok(Some(token))
	}
}
impl<'a, 'r> FromRequest<'a, 'r> for User {
	type Error = Error;

	fn from_request(request: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
		let conn = try_outcome!(request
			.guard::<DbConnGuard>()
			.map_failure(|_| (Status::InternalServerError, Error::GenericDb)));
		match get_logged_in_user(&conn, request) {
			Ok(Some(user)) => request::Outcome::Success(user),
			Ok(None) => request::Outcome::Forward(()),
			Err(e) => request::Outcome::Failure((Status::InternalServerError, e)),
		}
	}
}

fn get_logged_in_user(conn: &DbConn, request: &'_ Request<'_>) -> Result<Option<User>> {
	if let Some(token) = request.cookies().get_private(crate::models::account::SESSION_TOKEN_COOKIE_NAME) {
		User::get_from_token(conn, token.value()).map_err(From::from)
	} else {
		Ok(None)
	}
}
