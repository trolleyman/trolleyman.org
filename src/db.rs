pub type DbError = diesel::result::Error;
pub type DbResult<T> = Result<T, DbError>;

#[database("db")]
pub struct DbConn(diesel::SqliteConnection);

pub mod serde_naive_datetime {
	use chrono::prelude::*;
	use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

	pub fn serialize<S: Serializer>(time: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error> {
		DateTime::<Utc>::from_utc(*time, Utc).to_rfc3339().serialize(serializer)
	}

	pub fn _deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<NaiveDateTime, D::Error> {
		let time: &str = Deserialize::deserialize(deserializer)?;
		Ok(DateTime::parse_from_rfc3339(&time).map_err(D::Error::custom)?.naive_utc())
	}
}
