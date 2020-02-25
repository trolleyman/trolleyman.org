pub mod serde_datetime {
	use chrono::prelude::*;
	use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

	pub fn serialize<S: Serializer>(time: &DateTime<Utc>, serializer: S) -> Result<S::Ok, S::Error> {
		time.to_rfc3339().serialize(serializer)
	}

	#[allow(dead_code)]
	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<DateTime<Utc>, D::Error> {
		let time: &str = Deserialize::deserialize(deserializer)?;
		Ok(DateTime::parse_from_rfc3339(&time).map_err(D::Error::custom)?.with_timezone(&Utc))
	}
}

pub mod serde_hexstring {
	use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

	#[allow(dead_code)]
	pub fn serialize<S: Serializer>(bytes: &Vec<u8>, serializer: S) -> Result<S::Ok, S::Error> {
		todo!()
	}

	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Vec<u8>, D::Error> {
		todo!()
	}
}
