
use std::{fmt, str::FromStr};

use anyhow::Result;
use sha3::digest::Digest;


#[derive(Copy, Clone, Debug)]
pub enum HashAlgorithm {
	Sha3_512,
}
impl HashAlgorithm {
	pub fn hash(self, bytes: impl AsRef<[u8]>) -> Vec<u8> {
		let bytes = bytes.as_ref();
		match self {
			HashAlgorithm::Sha3_512 => {
				let hasher = sha3::Sha3_512::default();
				hasher.input(bytes);
				hasher.result().as_slice().into()
			}
		}
	}
}
impl Default for HashAlgorithm {
	fn default() -> HashAlgorithm {
		HashAlgorithm::Sha3_512
	}
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

	pub fn matches(&self, password: &str) -> bool { todo!() }
}
impl serde::Serialize for Password {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer,
	{
		serializer.serialize_str(&format!("{}:{}:{}", self.algorithm, self.salt, base64::encode(self.hash)))
	}
}

struct PasswordVisitor;

impl<'de> serde::de::Visitor<'de> for PasswordVisitor {
	type Value = Password;

	fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
		formatter.write_str("a string of the format \"<hash-algorithm>:<salt>:<hashed-password>\". <hash-algorith> must be \"sha3_512\", and <hashed-password> must be base 64 encoded")
	}

	fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
	where
		E: serde::de::Error,
	{
		let split: Vec<&str> = value.split(":").take(4).collect();
		if split.len() != 3 {
			return Err(E::custom("not of the format \"<hash-algorithm>:<salt>:<hashed-password>\""));
		}
		let algorithm = HashAlgorithm::from_str(split[0]).map_err(|e| E::custom(e))?;
		let salt = split[1].to_string();
		let hash = base64::decode(split[2]).map_err(|e| E::custom(format!("password not valid base64: {}", e)))?;
		Ok(Password::from_hash(hash, algorithm, salt))
	}
}

impl<'de> serde::Deserialize<'de> for Password {
	fn deserialize<D>(deserializer: D) -> Result<Password, D::Error>
	where
		D: serde::Deserializer<'de>,
	{
		deserializer.deserialize_str(PasswordVisitor)
	}
}
