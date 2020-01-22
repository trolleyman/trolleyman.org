
use rocket_contrib::templates::Template;


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
fn graph() -> Template {
	todo!("graph api")
}
