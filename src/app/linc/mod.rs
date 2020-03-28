use rocket_contrib::templates::Template;

use crate::{
	db::DbConn,
	models::linc::{LastEdited, Person, Interest}, error::Result,
};

pub fn routes() -> Vec<rocket::Route> { routes![index, demo, graph] }

#[get("/")]
fn index() -> Template { Template::render("linc/index", json!({})) }

#[get("/demo")]
fn demo() -> Template { Template::render("linc/demo", json!({})) }

#[get("/api/graph")]
fn graph(conn: DbConn) -> Result<String> {
	Ok(json!({
		"last_edited": LastEdited::get(&conn)?.to_rfc3339(),
		"people": Person::load_all(&conn)?,
		"interests": Interest::load_all(&conn)?,
	})
	.to_string())
}
