
use rocket_contrib::templates::Template;

pub fn routes() -> Vec<rocket::Route> { routes![signin_get, signin_post, signup_get, signup_post] }

#[get("/signin")]
fn signin_get() -> Template {
	Template::render("account/signin", json!({}))
}

#[post("/signin")]
fn signin_post() -> Template {
	Template::render("account/signin", json!({
		// TODO
	}))
}

#[get("/signup")]
fn signup_get() -> Template {
	Template::render("account/signup", json!({}))
}

#[post("/signup")]
fn signup_post() -> Template {
	Template::render("account/signup", json!({
		// TODO
	}))
}
