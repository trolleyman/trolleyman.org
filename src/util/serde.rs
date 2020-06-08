pub mod datetime {
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

pub mod naive_datetime {
	use chrono::prelude::*;
	use serde::{de::Error, Deserialize, Deserializer, Serialize, Serializer};

	pub fn serialize<S: Serializer>(time: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error> {
		DateTime::<Utc>::from_utc(*time, Utc).to_rfc3339().serialize(serializer)
	}

	#[allow(dead_code)]
	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<NaiveDateTime, D::Error> {
		let time: &str = Deserialize::deserialize(deserializer)?;
		Ok(DateTime::parse_from_rfc3339(&time).map_err(D::Error::custom)?.naive_utc())
	}
}

pub mod socketaddr {
	use serde::{de::Error, Deserialize, Deserializer, Serializer};
	use std::net::{SocketAddr, ToSocketAddrs};

	#[allow(dead_code)]
	pub fn serialize<S: Serializer>(addr: &SocketAddr, serializer: S) -> Result<S::Ok, S::Error> {
		serializer.serialize_str(&addr.to_string())
	}

	#[allow(dead_code)]
	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<SocketAddr, D::Error> {
		let addr: &str = Deserialize::deserialize(deserializer)?;
		addr.to_socket_addrs().map_err(D::Error::custom)?.next().ok_or(D::Error::custom("no socket addresses returned"))
	}
}

pub mod duration {
	use serde::{
		de::{Error, Visitor},
		Deserializer, Serializer,
	};
	use std::{fmt, time::Duration};

	#[allow(dead_code)]
	pub fn serialize<S: Serializer>(addr: &Duration, serializer: S) -> Result<S::Ok, S::Error> {
		serializer.serialize_str(&addr.as_secs_f64().to_string())
	}

	struct DurationVisitor;

	impl Visitor<'_> for DurationVisitor {
		type Value = Duration;

		fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result { formatter.write_str("numeric type") }

		fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E> where E: Error
		{
			if v >= 0 {
				Ok(Duration::from_secs(v as u64))
			} else {
				Err(E::custom(format!("duration cannot be negative: {}", v)))
			}
		}

		fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E> where E: Error
		{
			Ok(Duration::from_secs(v))
		}

		fn visit_f64<E>(self, v: f64) -> Result<Self::Value, E> where E: Error
		{
			Ok(Duration::from_secs_f64(v))
		}

		// TODO: Implement for strings
		//fn visit_str<E>(self, v: &str) -> Result<Self::Value, E> where E: Error
		//{
		//	Err(Error::invalid_type(serde::de::Unexpected::Str(v), &de))
		//}
	}

	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<Duration, D::Error> {
		deserializer.deserialize_any(DurationVisitor)
	}
}
