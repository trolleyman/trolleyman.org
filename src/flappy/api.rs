
use serde::Serialize;
use rocket::request::LenientForm;
use rocket_contrib::json::Json;
use diesel::prelude::*;

use crate::schema::flappy_leaderboard as leaderboard;
use crate::DbConn;
use crate::db::serde_naive_datetime;


#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "leaderboard"]
struct LeaderboardEntry {
	id: i32,
	name: String,
	score: i32,
	#[serde(with = "serde_naive_datetime")]
	timestamp: chrono::NaiveDateTime,
}

#[derive(Insertable, FromForm)]
#[table_name = "leaderboard"]
struct NewLeaderboardEntry {
	pub name: String,
	pub score: i32,
}


pub fn routes() -> Vec<rocket::Route> {
	routes![leaderboard, submit]
}

#[get("/api/leaderboard")]
fn leaderboard(conn: DbConn) -> Json<Vec<LeaderboardEntry>> {
	Json(leaderboard::table
		.order(leaderboard::score.desc())
		.limit(10)
		.load(&*conn)
		.unwrap_or_else(|_| vec![]))
}

// TODO: CSRF attacks
#[post("/api/submit", data = "<leaderboard_entry>")]
fn submit(leaderboard_entry: LenientForm<NewLeaderboardEntry>, conn: DbConn) -> Result<String, String> {
	leaderboard_entry.0.insert_into(leaderboard::table)
		.execute(&*conn).map(|_| format!("Success")).map_err(|_| format!("Error inserting new entry"))
}
