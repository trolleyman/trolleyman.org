
use chrono::prelude::*;

use crate::schema::user;

mod password;

pub use password::Password;


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
