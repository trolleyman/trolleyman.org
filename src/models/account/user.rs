use chrono::prelude::*;
use diesel::prelude::*;

use crate::{
	db::{DbConn, DbResult},
	models::schema::user,
};

pub use super::password::Password;

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "user"]
pub struct User {
	pub id: i32,
	pub name: String,
	pub email: String,
	pub password: Password,
	pub created: NaiveDateTime,
	pub admin: bool,
}
impl User {
	pub fn exists_with_name(conn: &DbConn, name: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::name.eq(name)))).get_result(&**conn)
	}

	pub fn get_with_username_or_email(conn: &DbConn, username_email: &str) -> DbResult<Option<User>> {
		if username_email.contains('@') {
			user::table.filter(user::email.eq(username_email)).first(&**conn).optional()
		} else {
			user::table.filter(user::name.eq(username_email)).first(&**conn).optional()
		}
	}
}
