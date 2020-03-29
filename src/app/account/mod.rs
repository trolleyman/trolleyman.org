use std::{collections::HashSet, time::Duration};

use rocket::{
	http::{Cookie, Cookies, SameSite},
	request::LenientForm,
	response::{content, Redirect},
};
use rocket_contrib::templates::Template;

use crate::{db::DbConn, error::Result, models::account::User};

mod types;

pub fn routes() -> Vec<rocket::Route> {
	routes![login_get, login_post, register_get, register_post, api_username_exists]
}

const RESERVED_USERNAMES_STRING: &'static str = include_str!("reserved_usernames.csv");
pub const USERNAME_REGEX: &'static str = "^\\w(\\w|[-_.])+$";
pub const USERNAME_MIN_LENGTH: i32 = 3;
pub const USERNAME_MAX_LENGTH: i32 = 20;
pub const EMAIL_MAX_LENGTH: i32 = 30;
pub const PASSWORD_MIN_LENGTH: i32 = 8;
pub const PASSWORD_MAX_LENGTH: i32 = 32;

lazy_static! {
	static ref RESERVED_USERNAMES_LOWERCASE: HashSet<String> = {
		let mut set = HashSet::new();
		for line in RESERVED_USERNAMES_STRING.lines() {
			let lower = line.trim().to_lowercase();
			if lower.len() > 0 {
				set.insert(lower);
			}
		}
		set
	};
}

pub fn is_username_reserved(username: &str) -> bool { RESERVED_USERNAMES_LOWERCASE.contains(&username.to_lowercase()) }

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

fn login_error(msg: &str) -> types::TemplateRedirect {
	types::TemplateRedirect::from(Template::render("account/login", default_context(json!({ "error": msg }))))
}

#[get("/api/username_exists?<username>")]
fn api_username_exists(conn: DbConn, username: String) -> Result<content::Json<&'static str>, String> {
	std::thread::sleep(std::time::Duration::from_secs(5));
	if is_username_reserved(&username)
		|| User::exists_with_name(&conn, &username).map_err(|_| format!("database error"))?
	{
		Ok(content::Json("true"))
	} else {
		Ok(content::Json("false"))
	}
}

#[get("/login")]
fn login_get() -> Template { Template::render("account/login", default_context(json!({}))) }

#[post("/login", data = "<form>")]
fn login_post(conn: DbConn, mut cookies: Cookies, form: LenientForm<types::LoginForm>) -> Result<types::TemplateRedirect> {
	let user = match User::get_with_username_or_email(&conn, &form.username)? {
		Some(u) => u,
		None => return Ok(login_error("A user with that name could not be found")),
	};

	// Create login session
	let secs = 60 * 24 * 365;
	let max_age = Duration::from_secs(secs);
	let token = match user.new_session_token(&conn, &form.password, max_age)? {
		Some(token) => token,
		None => return Ok(login_error("The password entered is not correct")),
	};

	cookies.add_private(
		Cookie::build(crate::models::account::SESSION_TOKEN_COOKIE_NAME, token).same_site(SameSite::Strict).max_age(time::Duration::seconds(secs as i64)).finish(),
	);
	Ok(Redirect::to("/").into())
}

#[get("/register")]
fn register_get() -> Template { Template::render("account/register", default_context(json!({}))) }

#[post("/register", data = "<_form>")]
fn register_post(_form: LenientForm<types::RegisterForm>) -> Result<Redirect> { todo!() }
