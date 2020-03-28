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
	id: i32,
	pub name: String,
	pub email: String,
	pub password: Password,
	pub created: NaiveDateTime,
	pub admin: bool,
}
impl User {
	pub fn exists_with_name(conn: &DbConn, name: &str) -> DbResult<bool> {
		use diesel::dsl::{exists, select};
		select(exists(user::table.filter(user::dsl::name.eq(name)))).get_result(&**conn)
	}
}
