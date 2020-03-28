use rocket_contrib::templates::Template;

pub fn routes() -> Vec<rocket::Route> { routes![game] }

#[get("/")]
fn game() -> Template { Template::render("tanks/game", json!({})) }
