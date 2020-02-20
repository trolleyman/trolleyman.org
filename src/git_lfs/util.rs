
pub mod serde_datetime {
	use chrono::prelude::*;
	use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

	pub fn serialize<S: Serializer>(time: &DateTime<FixedOffset>, serializer: S) -> Result<S::Ok, S::Error> {
		time.to_rfc3339().serialize(serializer)
	}

	pub fn _deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<DateTime<FixedOffset>, D::Error> {
		let time: &str = Deserialize::deserialize(deserializer)?;
		Ok(DateTime::parse_from_rfc3339(&time).map_err(D::Error::custom)?)
	}
}
