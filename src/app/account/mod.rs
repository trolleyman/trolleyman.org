use std::time::Duration;

use multimap::MultiMap;
use rocket::{
	config::Environment,
	http::{Cookie, Cookies, SameSite},
	request::LenientForm,
	response::Redirect,
	State,
};
use rocket_contrib::{json::Json, templates::Template};
use serde_json::Value as JsonValue;

use crate::{
	config::Config,
	db::DbConnGuard,
	error::Result,
	models::account::{User, SESSION_TOKEN_COOKIE_NAME},
};

mod types;
pub mod validation;

pub fn routes() -> Vec<rocket::Route> {
	// TODO: /account, /account/logout, /account/forgot, /account/<user>(?)
	routes![api_username_available, login_get, login_post, register_get, register_post, me, me_no_user, logout]
}

fn default_context(user: Option<&User>, patch: &JsonValue) -> JsonValue {
	let mut base = json!({
		"USERNAME_REGEX": validation::USERNAME_REGEX_STRING,
		"USERNAME_MIN_LENGTH": validation::USERNAME_MIN_LENGTH,
		"USERNAME_MAX_LENGTH": validation::USERNAME_MAX_LENGTH,
		"EMAIL_REGEX": validation::EMAIL_REGEX_STRING,
		"EMAIL_MAX_LENGTH": validation::EMAIL_MAX_LENGTH,
		"PASSWORD_REGEX": validation::PASSWORD_REGEX_STRING,
		"PASSWORD_MIN_LENGTH": validation::PASSWORD_MIN_LENGTH,
		"PASSWORD_MAX_LENGTH": validation::PASSWORD_MAX_LENGTH,
	});
	if let Some(user) = user {
		base = merge(
			base,
			&json!({
				"current_user": {
					"name": user.name,
					"email": user.email,
					"admin": user.admin,
				},
			}),
		);
	}
	merge(base, patch)
}

fn merge(mut base: JsonValue, patch: &JsonValue) -> JsonValue {
	json_patch::merge(&mut base, patch);
	base
}

fn login_error(user: Option<&User>, form: &types::LoginForm, msg: &str) -> types::TemplateRedirect {
	types::TemplateRedirect::from(Template::render(
		"account/login",
		default_context(user, &json!({ "error": msg, "username": form.username, "remember": form.remember })),
	))
}

fn register_error(user: Option<&User>, form: &types::RegisterForm, value: &JsonValue) -> types::TemplateRedirect {
	types::TemplateRedirect::from(Template::render(
		"account/register",
		default_context(
			user,
			&merge(
				json!({
					"username": form.username,
					"email": form.email,
					"email2": form.email2,
				}),
				value,
			),
		),
	))
}

#[get("/api/username_available?<username>")]
fn api_username_available(conn: DbConnGuard, username: String) -> Result<Json<bool>> {
	Ok(Json(validation::username_available(&conn, &username)?))
}

#[get("/login")]
fn login_get(user: Option<User>) -> Template {
	Template::render("account/login", default_context(user.as_ref(), &json!({})))
}

#[post("/login", data = "<form>")]
fn login_post(
	conn: DbConnGuard,
	user: Option<User>,
	mut cookies: Cookies,
	config: State<Config>,
	environment: State<Environment>,
	form: LenientForm<types::LoginForm>,
) -> Result<types::TemplateRedirect> {
	let new_user = match User::try_get_from_name_or_email(&conn, &form.username)? {
		Some(u) => u,
		None =>
			return Ok(login_error(
				user.as_ref(),
				&form.0,
				"A user with that username or email address could not be found",
			)),
	};

	// Create login session
	debug!("Logging in {}...", new_user.name);
	let secs = 60 * 24 * 365;
	let max_age = Duration::from_secs(secs);
	let token = match new_user.new_session_token(&conn, &form.password, max_age)? {
		Some(token) => token,
		None => return Ok(login_error(user.as_ref(), &form.0, "The password entered is not correct")),
	};

	debug!("Logged in {} (token={})", new_user.name, token);
	cookies.add_private(get_session_cookie(token, &*config, *environment, secs as i64));
	Ok(Redirect::to("/account/me").into())
}

fn get_session_cookie(token: String, config: &Config, environment: Environment, seconds: i64) -> Cookie<'static> {
	let mut builder = Cookie::build(SESSION_TOKEN_COOKIE_NAME, token)
		.same_site(SameSite::Strict)
		.expires(time::OffsetDateTime::now() + time::Duration::seconds(seconds));

	if !environment.is_dev() {
		builder = builder.secure(true).domain(config.domain.clone());
	}
	builder.finish()
}

#[get("/register")]
fn register_get(user: Option<User>) -> Template {
	Template::render("account/register", default_context(user.as_ref(), &json!({})))
}

#[post("/register", data = "<form>")]
fn register_post(
	user: Option<User>,
	conn: DbConnGuard,
	form: LenientForm<types::RegisterForm>,
) -> Result<types::TemplateRedirect> {
	let mut errors = MultiMap::new();

	// Username
	errors.insert_many("username", validation::get_errors_for_username(&conn, &form.username)?);

	// Email address
	errors.insert_many("email", validation::get_errors_for_account_email(&conn, &form.email)?);

	// Password
	errors.insert_many("password", validation::get_errors_for_password(&form.password));

	if errors.len() > 0 {
		Ok(register_error(
			user.as_ref(),
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
		debug!("Registered new user {} ({})", form.username, form.email);
		todo!()
	}
}

#[get("/me")]
fn me(user: User) -> Template { Template::render("account/account", default_context(Some(&user), &json!({}))) }

#[get("/me", rank = 1)]
fn me_no_user() -> Redirect {
	// TODO: Flash message
	Redirect::to("/account/login")
}

#[post("/logout")]
fn logout(mut cookies: Cookies) -> Redirect {
	cookies.remove_private(Cookie::named(SESSION_TOKEN_COOKIE_NAME));
	// TODO: Flash message
	Redirect::to("/account/login")
}
