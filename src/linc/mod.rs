
use serde::Serialize;
use rocket_contrib::templates::Template;
use diesel::prelude::*;

use crate::DbConn;
use crate::schema::linc_person as person;
use crate::schema::linc_interest as interest;


#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "interest"]
struct Interest {
	id: i32,
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
	twitter_pic_url: String,
	twitter: String,
}


pub fn routes() -> Vec<rocket::Route> {
	routes![index, demo, graph]
}

#[get("/")]
fn index() -> Template {
	Template::render("linc/index", json!({}))
}

#[get("/demo")]
fn demo() -> Template {
	Template::render("linc/demo", json!({}))
}

#[get("/api/graph")]
fn graph(conn: DbConn) -> Result<String, String> {
	Ok(json!({
		"people": person::table.load::<Person>(&*conn).map_err(|_| format!("Database error"))?,
		"interests": interest::table.load::<Interest>(&*conn).map_err(|_| format!("Database error"))?,
	}).to_string())
}
