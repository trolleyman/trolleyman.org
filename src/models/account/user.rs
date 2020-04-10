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

#[derive(Clone, Queryable, Identifiable, Debug)]
#[table_name = "user"]
pub struct User {
	id: i32,
	pub name: String,
	pub email: String,
	pub password: Password,
	pub created: NaiveDateTime,
	pub admin: bool,
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

	pub fn try_get_from_name(conn: &DbConn, username: &str) -> DbResult<Option<User>> {
		user::table.filter(user::name.eq(username)).first(conn).optional()
	}

	pub fn try_get_from_email(conn: &DbConn, email: &str) -> DbResult<Option<User>> {
		user::table.filter(user::email.eq(email)).first(conn).optional()
	}

	pub fn try_get_from_name_or_email(conn: &DbConn, name_or_email: &str) -> DbResult<Option<User>> {
		if name_or_email.contains('@') {
			User::try_get_from_email(conn, name_or_email)
		} else {
			User::try_get_from_name(conn, name_or_email)
		}
	}

	pub fn get_from_name(conn: &DbConn, username: &str) -> Result<User> {
		User::try_get_from_name(conn, username)?
			.ok_or_else(|| Error::NotFound(format!("User not found with username {}", username)))
	}

	pub fn get_from_email(conn: &DbConn, email: &str) -> Result<User> {
		User::try_get_from_email(conn, email)?
			.ok_or_else(|| Error::NotFound(format!("User not found with email {}", email)))
	}

	pub fn get_from_name_or_email(conn: &DbConn, name_or_email: &str) -> Result<User> {
		User::try_get_from_name_or_email(conn, name_or_email)?
			.ok_or_else(|| Error::NotFound(format!("User not found with name or email {}", name_or_email)))
	}

	pub fn id(&self) -> i32 { self.id }

	/// Saves the `User` to the database
	pub fn save(&self, conn: &DbConn) -> DbResult<()> {
		// TODO: Remove login tokens when password changes
		diesel::update(user::table.filter(user::id.eq(self.id)))
			.set((
				user::name.eq(&self.name),
				user::email.eq(&self.email),
				user::password.eq(&self.password),
				user::created.eq(self.created),
				user::admin.eq(self.admin),
			))
			.execute(conn)?;
		Ok(())
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
