
use chrono::prelude::*;

use crate::db::{DbConn, DbResult};

mod password;

pub use password::Password;


pub struct User {
	id: i32,
	pub name: String,
	pub email: String,
	pub password: Password,
	pub created: DateTime<Utc>,
	pub admin: bool,
}
impl User {
	pub fn load(conn: &DbConn) -> DbResult<User> { todo!() }

	pub fn save(&self, conn: &DbConn) -> DbResult<()> { todo!() }
}

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_password_deserialization() {
		let password =
			"sha3_512:salt:eWIL5kh062FCGJ0jC0NklczuNkq+Bigyrmscrvv+0F9I53W8uqFb8skx83jB4NodoUqRanKyvx7s3w9lnaV/bQ==";
		let password_json = serde_json::Value::String(password.into());
		let parsed_password: Password = serde_json::from_value(password_json).unwrap();
		assert!(parsed_password.matches("password"));
	}

	#[test]
	fn test_password_serialization() {
		let password = Password::from_password("password", HashAlgorithm::Sha3_512, "salt".into());
		assert_eq!(serde_json::to_value(password).unwrap(), serde_json::Value::String("sha3_512:salt:eWIL5kh062FCGJ0jC0NklczuNkq+Bigyrmscrvv+0F9I53W8uqFb8skx83jB4NodoUqRanKyvx7s3w9lnaV/bQ==".into()));
	}
}
