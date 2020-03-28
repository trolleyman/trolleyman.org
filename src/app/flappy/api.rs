use rocket::request::LenientForm;
use rocket_contrib::json::Json;

use crate::{
	db::DbConn,
	error::Result,
	models::flappy::{LeaderboardEntry, NewLeaderboardEntry},
};

pub fn routes() -> Vec<rocket::Route> { routes![leaderboard, submit] }

#[get("/api/leaderboard")]
fn leaderboard(conn: DbConn) -> Result<Json<Vec<LeaderboardEntry>>> {
	Ok(Json(LeaderboardEntry::get_top_entries(&conn, 10)?))
}

// TODO: CSRF attacks
#[post("/api/submit", data = "<leaderboard_entry>")]
fn submit(leaderboard_entry: LenientForm<NewLeaderboardEntry>, conn: DbConn) -> Result<()> {
	leaderboard_entry.0.save_new(&conn)
}
