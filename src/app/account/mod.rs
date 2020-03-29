use std::{collections::HashSet, time::Duration};

use multimap::MultiMap;
use regex::Regex;
use rocket::{
	http::{Cookie, Cookies, SameSite},
	request::LenientForm,
	response::Redirect,
	State,
};
use rocket_contrib::{json::Json, templates::Template};
use serde_json::Value as JsonValue;

use crate::{
	config::Config,
	db::{DbConnGuard, DbResult},
	error::Result,
	models::account::User,
};

mod types;

pub fn routes() -> Vec<rocket::Route> {
	routes![login_get, login_post, register_get, register_post, api_username_available]
}

const RESERVED_USERNAMES_STRING: &'static str = include_str!("reserved_usernames.csv");
pub const USERNAME_REGEX_STRING: &'static str = r"^\w(\w|[-_.])+$";
pub const USERNAME_MIN_LENGTH: usize = 3;
pub const USERNAME_MAX_LENGTH: usize = 20;
pub const EMAIL_REGEX_STRING: &'static str = r"^\S+@\S+\.\S+$";
pub const EMAIL_MAX_LENGTH: usize = 30;
pub const PASSWORD_REGEX_STRING: &'static str = r"[0-9]";
pub const PASSWORD_MIN_LENGTH: usize = 8;
pub const PASSWORD_MAX_LENGTH: usize = 32;

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
	pub static ref USERNAME_REGEX: Regex = Regex::new(USERNAME_REGEX_STRING).expect("Invalid regex");
	pub static ref EMAIL_REGEX: Regex = Regex::new(EMAIL_REGEX_STRING).expect("Invalid regex");
	pub static ref PASSWORD_REGEX: Regex = Regex::new(PASSWORD_REGEX_STRING).expect("Invalid regex");
}

pub fn is_username_reserved(username: &str) -> bool { RESERVED_USERNAMES_LOWERCASE.contains(&username.to_lowercase()) }

fn default_context(patch: &JsonValue) -> JsonValue {
	merge(
		json!({
			"USERNAME_REGEX": USERNAME_REGEX_STRING,
			"USERNAME_MIN_LENGTH": USERNAME_MIN_LENGTH,
			"USERNAME_MAX_LENGTH": USERNAME_MAX_LENGTH,
			"EMAIL_REGEX": EMAIL_REGEX_STRING,
			"EMAIL_MAX_LENGTH": EMAIL_MAX_LENGTH,
			"PASSWORD_REGEX": PASSWORD_REGEX_STRING,
			"PASSWORD_MIN_LENGTH": PASSWORD_MIN_LENGTH,
			"PASSWORD_MAX_LENGTH": PASSWORD_MAX_LENGTH,
		}),
		patch,
	)
}

fn merge(mut base: JsonValue, patch: &JsonValue) -> JsonValue {
	json_patch::merge(&mut base, patch);
	base
}

fn login_error(form: &types::LoginForm, msg: &str) -> types::TemplateRedirect {
	types::TemplateRedirect::from(Template::render(
		"account/login",
		default_context(&json!({ "error": msg, "username": form.username, "remember": form.remember })),
	))
}

fn register_error(form: &types::RegisterForm, value: &JsonValue) -> types::TemplateRedirect {
	types::TemplateRedirect::from(Template::render(
		"account/register",
		default_context(&merge(
			json!({
				"username": form.username,
				"email": form.email,
				"email2": form.email2,
			}),
			value,
		)),
	))
}

fn username_available(conn: &DbConnGuard, username: &str) -> DbResult<bool> {
	Ok(!is_username_reserved(username) && !User::exists_with_name(&conn, username)?)
}

#[get("/api/username_available?<username>")]
fn api_username_available(conn: DbConnGuard, username: String) -> Result<Json<bool>> {
	Ok(Json(username_available(&conn, &username)?))
}

#[get("/login")]
fn login_get() -> Template { Template::render("account/login", default_context(&json!({}))) }

#[post("/login", data = "<form>")]
fn login_post(
	conn: DbConnGuard,
	mut cookies: Cookies,
	config: State<Config>,
	form: LenientForm<types::LoginForm>,
) -> Result<types::TemplateRedirect> {
	let user = match User::get_with_username_or_email(&conn, &form.username)? {
		Some(u) => u,
		None => return Ok(login_error(&form.0, "A user with that username or email address could not be found")),
	};

	// Create login session
	let secs = 60 * 24 * 365;
	let max_age = Duration::from_secs(secs);
	let token = match user.new_session_token(&conn, &form.password, max_age)? {
		Some(token) => token,
		None => return Ok(login_error(&form.0, "The password entered is not correct")),
	};

	cookies.add_private(
		Cookie::build(crate::models::account::SESSION_TOKEN_COOKIE_NAME, token)
			.secure(true)
			.same_site(SameSite::Strict)
			.domain(config.domain.clone())
			.expires(time::OffsetDateTime::now() + time::Duration::seconds(secs as i64))
			.finish(),
	);
	Ok(Redirect::to("/").into())
}

#[get("/register")]
fn register_get() -> Template { Template::render("account/register", default_context(&json!({}))) }

#[post("/register", data = "<form>")]
fn register_post(conn: DbConnGuard, form: LenientForm<types::RegisterForm>) -> Result<types::TemplateRedirect> {
	let mut errors = MultiMap::new();

	// Username
	if !username_available(&conn, &form.username)? {
		errors.insert("username", "User with name already exists".into());
	}
	if form.username.len() < USERNAME_MIN_LENGTH {
		errors.insert("username", format!("Username must be at least {} characters in length", USERNAME_MIN_LENGTH));
	}
	if form.username.len() > USERNAME_MAX_LENGTH {
		errors.insert("username", format!("Username must be at most {} characters in length", USERNAME_MAX_LENGTH));
	}
	if !USERNAME_REGEX.is_match(&form.username) {
		errors.insert("username", "Username must contain only alphanumeric characters, hyphens, and full stops".into());
	}

	// Email address
	if User::exists_with_email(&conn, &form.email)? {
		errors.insert(
			"email",
			"User with email address already exists. <a href=\"/account/forgot\">Forgot your password?</a>".into(),
		);
	}
	if form.email.len() > EMAIL_MAX_LENGTH {
		errors.insert("email", format!("Email address must be at most {} characters in length", EMAIL_MAX_LENGTH));
	}
	if !EMAIL_REGEX.is_match(&form.email) {
		errors.insert("email", "Email address must be of the form user@example.com".into());
	}

	// Password
	if form.password.len() < PASSWORD_MIN_LENGTH {
		errors.insert("password", format!("Password must be at least {} characters in length", PASSWORD_MIN_LENGTH));
	}
	if form.password.len() > PASSWORD_MAX_LENGTH {
		errors.insert("password", format!("Password must be at most {} characters in length", PASSWORD_MAX_LENGTH));
	}
	if !PASSWORD_REGEX.is_match(&form.password) {
		errors.insert("password", format!("Password must contain numeric characters (0-9)"));
	}

	if errors.len() > 0 {
		Ok(register_error(
			&form.0,
			&json!({
				"errors": {
					"username": errors.get_vec("username"),
					"email": errors.get_vec("email"),
					"password": errors.get_vec("password"),
				}
			}),
		))
	} else {
		todo!()
	}
}
