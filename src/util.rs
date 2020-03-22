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

pub mod serde_naive_datetime {
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

pub mod serde_socketaddr {
	use std::net::{SocketAddr, ToSocketAddrs};
	use serde::{de::Error, Deserialize, Deserializer, Serializer};

	#[allow(dead_code)]
	pub fn serialize<S: Serializer>(addr: &SocketAddr, serializer: S) -> Result<S::Ok, S::Error> {
		serializer.serialize_str(&addr.to_string())
	}

	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<SocketAddr, D::Error> {
		let addr: &str = Deserialize::deserialize(deserializer)?;
		addr.to_socket_addrs().map_err(D::Error::custom)?.next().ok_or(D::Error::custom("no socket addresses returned"))
	}
}
