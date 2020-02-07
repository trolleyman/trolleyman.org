use rocket_contrib::templates::Template;

mod api;

pub fn routes() -> Vec<rocket::Route> {
	let mut routes = routes![game];
	routes.append(&mut api::routes());
	routes
}

#[get("/")]
fn game() -> Template { Template::render("flappy/game", json!({})) }
