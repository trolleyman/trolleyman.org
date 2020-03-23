
use rocket_contrib::templates::Template;

pub fn routes() -> Vec<rocket::Route> { routes![login_get, login_post, register_get, register_post] }


pub const USERNAME_REGEX: &'static str = "^\\w(\\w|[-_.])+$";
pub const USERNAME_MIN_LENGTH: i32 = 3;
pub const USERNAME_MAX_LENGTH: i32 = 20;
pub const EMAIL_MAX_LENGTH: i32 = 30;
pub const PASSWORD_MIN_LENGTH: i32 = 8;
pub const PASSWORD_MAX_LENGTH: i32 = 32;


fn default_context(patch: serde_json::Value) -> serde_json::Value {
	let mut ctx = json!({
		"username_regex": USERNAME_REGEX,
		"username_min_length": USERNAME_MIN_LENGTH,
		"username_max_length": USERNAME_MAX_LENGTH,
		"email_max_length": EMAIL_MAX_LENGTH,
		"password_min_length": PASSWORD_MIN_LENGTH,
		"password_max_length": PASSWORD_MAX_LENGTH,
	});
	json_patch::merge(&mut ctx, &patch);
	ctx
}

#[get("/login")]
fn login_get() -> Template {
	Template::render("account/login", default_context(json!({})))
}

#[post("/login")]
fn login_post() -> Template {
	Template::render("account/login", default_context(json!({})))
}

#[get("/register")]
fn register_get() -> Template {
	Template::render("account/register", default_context(json!({})))
}

#[post("/register")]
fn register_post() -> Template {
	Template::render("account/register", default_context(json!({})))
}
