use chrono::prelude::*;
use diesel::prelude::*;
use rocket_contrib::templates::Template;
use serde::Serialize;

use crate::{
	db::DbConn,
	schema::{linc_interest as interest, linc_lastedited as lastedited, linc_person as person},
};

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "interest"]
struct Interest {
	id:   i32,
	name: String,
	desc: String,
}

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "person"]
struct Person {
	id: i32,
	name: String,
	interest1_id: Option<i32>,
	interest2_id: Option<i32>,
	interest3_id: Option<i32>,
	twitter_pic_url: Option<String>,
	twitter: Option<String>,
}

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "lastedited"]
struct LastEdited {
	id:        i32,
	#[serde(with = "crate::util::serde_naive_datetime")]
	timestamp: NaiveDateTime,
}

#[derive(Insertable)]
#[table_name = "lastedited"]
struct NewLastEdited {
	timestamp: NaiveDateTime,
}

pub fn routes() -> Vec<rocket::Route> { routes![index, demo, graph] }

#[get("/")]
fn index() -> Template { Template::render("linc/index", json!({})) }

#[get("/demo")]
fn demo() -> Template { Template::render("linc/demo", json!({})) }

#[get("/api/graph")]
fn graph(conn: DbConn) -> Result<String, String> {
	let lastedited = match lastedited::table.first::<LastEdited>(&*conn).optional() {
		Ok(Some(e)) => e.timestamp,
		Ok(None) => {
			let timestamp = Utc::now().naive_utc();
			NewLastEdited { timestamp }
				.insert_into(lastedited::table)
				.execute(&*conn)
				.map_err(|_| format!("Database error inserting last edited"))?;
			timestamp
		}
		Err(_) => return Err(format!("Database error getting last edited")),
	};
	Ok(json!({
		"last_edited": DateTime::<Utc>::from_utc(lastedited, Utc).to_rfc3339(),
		"people": person::table.load::<Person>(&*conn).map_err(|_| format!("Database error"))?,
		"interests": interest::table.load::<Interest>(&*conn).map_err(|_| format!("Database error"))?,
	})
	.to_string())
}
