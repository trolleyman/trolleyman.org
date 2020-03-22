use std::{fmt, str::FromStr};

use anyhow::{Context, Result};
use diesel::deserialize::FromSql;
use sha3::digest::Digest;

#[derive(Copy, Clone, PartialEq, Eq, Debug)]
pub enum HashAlgorithm {
	Sha3_512,
}
impl HashAlgorithm {
	pub fn hash(self, bytes: impl AsRef<[u8]>) -> Vec<u8> {
		let bytes = bytes.as_ref();
		match self {
			HashAlgorithm::Sha3_512 => {
				let mut hasher = sha3::Sha3_512::default();
				hasher.input(bytes);
				hasher.result().as_slice().into()
			}
		}
	}
}
impl Default for HashAlgorithm {
	fn default() -> HashAlgorithm { HashAlgorithm::Sha3_512 }
}
impl FromStr for HashAlgorithm {
	type Err = anyhow::Error;

	fn from_str(s: &str) -> Result<HashAlgorithm> {
		match s {
			"sha3_512" => Ok(HashAlgorithm::Sha3_512),
			_ => Err(anyhow!("expected \"sha3_512\"")),
		}
	}
}
impl fmt::Display for HashAlgorithm {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		match self {
			HashAlgorithm::Sha3_512 => f.write_str("sha3_512"),
		}
	}
}

#[derive(Clone, Debug, PartialEq, Eq, AsExpression)]
#[sql_type = "diesel::sql_types::Text"]
pub struct Password {
	hash:      Vec<u8>,
	algorithm: HashAlgorithm,
	salt:      String,
}
impl Password {
	pub fn from_hash(hash: Vec<u8>, algorithm: HashAlgorithm, salt: String) -> Password {
		Password { hash, algorithm, salt }
	}

	pub fn from_password(password: &str, algorithm: HashAlgorithm, salt: String) -> Password {
		let full_password = format!("{}:{}", salt, password);
		let hash = algorithm.hash(&full_password);
		Password::from_hash(hash, algorithm, salt)
	}

	pub fn matches(&self, password: &str) -> bool { &Password::from_password(password, self.algorithm, self.salt.clone()) == self }
}
impl FromStr for Password {
	type Err = anyhow::Error;

	fn from_str(s: &str) -> Result<Password> {
		let split: Vec<&str> = s.split(":").take(4).collect();
		ensure!(split.len() == 3, "not of the format \"<hash-algorithm>:<salt>:<hashed-password>\"");

		let algorithm = HashAlgorithm::from_str(split[0]).context("invalid hash algorithm")?;
		let salt = split[1].to_string();
		let hash = base64::decode(split[2]).context("password not valid base64")?;
		Ok(Password::from_hash(hash, algorithm, salt))
	}
}
impl fmt::Display for Password {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		use std::fmt::Write;

		f.write_fmt(format_args!("{}", self.algorithm))?;
		f.write_char(':')?;
		f.write_fmt(format_args!("{}", self.salt))?;
		f.write_char(':')?;
		f.write_str(&base64::encode(&self.hash))?;
		Ok(())
	}
}
impl<ST, DB> FromSql<ST, DB> for Password
where
	DB: diesel::backend::Backend,
	*const str: FromSql<ST, DB>,
{
	fn from_sql(bytes: Option<&DB::RawValue>) -> diesel::deserialize::Result<Self> {
		let str_ptr = <*const str as FromSql<ST, DB>>::from_sql(bytes)?;
		// We know that the pointer impl will never return null
		let string: &str = unsafe { &*str_ptr };
		string.parse::<Password>().map_err(|e| Box::new(AnyError(e)) as Box<_>)
	}
}

#[derive(Debug, thiserror::Error)]
#[error(transparent)]
struct AnyError(anyhow::Error);


#[allow(dead_code)]
#[derive(FromSqlRow, AsExpression)]
#[diesel(foreign_derive)]
struct PasswordProxy(Password);

#[cfg(test)]
mod tests {
	use super::*;

	#[test]
	fn test_password_deserialization() {
		let password =
			"sha3_512:salt:eWIL5kh062FCGJ0jC0NklczuNkq+Bigyrmscrvv+0F9I53W8uqFb8skx83jB4NodoUqRanKyvx7s3w9lnaV/bQ==";
		assert!(password.parse::<Password>().unwrap().matches("password"));
	}

	#[test]
	fn test_password_serialization() {
		let password = Password::from_password("password", HashAlgorithm::Sha3_512, "salt".into());
		assert_eq!(
			format!("{}", password),
			"sha3_512:salt:eWIL5kh062FCGJ0jC0NklczuNkq+Bigyrmscrvv+0F9I53W8uqFb8skx83jB4NodoUqRanKyvx7s3w9lnaV/bQ=="
		);
	}

	// #[test]
	// fn test_password_sql() {
	// 	use crate::diesel::IntoSql;

	// 	let password = "sha3_512:salt:eWIL5kh062FCGJ0jC0NklczuNkq+Bigyrmscrvv+0F9I53W8uqFb8skx83jB4NodoUqRanKyvx7s3w9lnaV/bQ==";
	// 	let password_obj: Password = password.parse().unwrap();
	// 	assert_eq!(password_obj.into_sql(), "TODO".to_string());
	// }
}