use diesel::prelude::*;
use serde::Serialize;

use crate::{
	db::{DbConn, DbResult},
	schema::flappy_leaderboard as leaderboard,
};

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "leaderboard"]
pub struct LeaderboardEntry {
	pub id:        i32,
	pub name:      String,
	pub score:     i32,
	#[serde(with = "crate::util::serde_naive_datetime")]
	pub timestamp: chrono::NaiveDateTime,
}
impl LeaderboardEntry {
	pub fn get_top_entries(conn: &DbConn, num: i64) -> DbResult<Vec<LeaderboardEntry>> {
		leaderboard::table.order(leaderboard::score.desc()).limit(num).load(&**conn)
	}
}

#[derive(Insertable, FromForm)]
#[table_name = "leaderboard"]
pub struct NewLeaderboardEntry {
	pub name:  String,
	pub score: i32,
}
impl NewLeaderboardEntry {
	pub fn save_new(&self, conn: &DbConn) -> DbResult<()> { self.insert_into(leaderboard::table).execute(&**conn).map(|_| ()) }
}
