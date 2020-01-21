
use serde::Serialize;
use chrono::prelude::*;
use rocket_contrib::json::Json;
use diesel::prelude::*;

use crate::DbConn;


#[derive(Queryable, Serialize)]
struct LeaderboardEntry {
	id: i32,
	name: String,
	score: i32,
    #[serde(with = "serde_naive_datetime")]
	timestamp: chrono::NaiveDateTime,
}

mod serde_naive_datetime {
	use super::*;
	use serde::{Serialize, Serializer, Deserialize, Deserializer, de::Error};

	pub fn serialize<S: Serializer>(time: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error> {
		DateTime::<Utc>::from_utc(*time, Utc).to_rfc3339().serialize(serializer)
	}

	pub fn deserialize<'de, D: Deserializer<'de>>(deserializer: D) -> Result<NaiveDateTime, D::Error> {
		let time: &str = Deserialize::deserialize(deserializer)?;
		Ok(DateTime::parse_from_rfc3339(&time).map_err(D::Error::custom)?.naive_utc())
	}
}


pub fn routes() -> Vec<rocket::Route> {
	routes![leaderboard]
}

#[get("/api/leaderboard")]
fn leaderboard(conn: DbConn) -> Json<Vec<LeaderboardEntry>> {
	use crate::schema::flappy_leaderboard as leaderboard;
	Json(leaderboard::table
		.order(leaderboard::score.desc())
		.limit(10)
		.load(&*conn)
		.unwrap_or_else(|_| vec![]))
}
