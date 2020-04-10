use std::collections::HashSet;

use regex::Regex;

use crate::{
	db::{DbConn, DbResult},
	error::Result,
	models::account::User,
};

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

pub fn username_available(conn: &DbConn, username: &str) -> DbResult<bool> {
	Ok(!is_username_reserved(username) && !User::exists_with_name(conn, username)?)
}

pub fn is_username_reserved(username: &str) -> bool { RESERVED_USERNAMES_LOWERCASE.contains(&username.to_lowercase()) }

pub fn get_errors_for_username(conn: &DbConn, username: &str) -> Result<Vec<String>> {
	let mut errors = Vec::new();
	if is_username_reserved(username) {
		errors.push("Username is reserved".into());
	}
	if User::exists_with_name(conn, username)? {
		errors.push("Username already taken".into());
	}
	if username.len() < USERNAME_MIN_LENGTH {
		errors.push(format!("Username must be at least {} characters in length", USERNAME_MIN_LENGTH));
	}
	if username.len() > USERNAME_MAX_LENGTH {
		errors.push(format!("Username must be at most {} characters in length", USERNAME_MAX_LENGTH));
	}
	if !USERNAME_REGEX.is_match(&username) {
		errors.push("Username must contain only alphanumeric characters, hyphens, and full stops".into());
	}
	Ok(errors)
}

pub fn get_errors_for_email(email: &str) -> Result<Vec<String>> {
	let mut errors = Vec::new();
	if email.len() > EMAIL_MAX_LENGTH {
		errors.push(format!("Email address must be at most {} characters in length", EMAIL_MAX_LENGTH));
	}
	if !EMAIL_REGEX.is_match(&email) {
		errors.push("Email address must be of the form user@example.com".into());
	}
	Ok(errors)
}

pub fn get_errors_for_account_email(conn: &DbConn, email: &str) -> Result<Vec<String>> {
	let mut errors = Vec::new();
	if User::exists_with_email(conn, &email)? {
		errors.push(
			"User with email address already exists. <a href=\"/account/forgot\">Forgot your password?</a>".into(),
		);
	}
	errors.append(&mut get_errors_for_email(email)?);
	Ok(errors)
}

pub fn get_errors_for_password(password: &str) -> Vec<String> {
	let mut errors = Vec::new();
	if password.len() < PASSWORD_MIN_LENGTH {
		errors.push(format!("Password must be at least {} characters in length", PASSWORD_MIN_LENGTH));
	}
	if password.len() > PASSWORD_MAX_LENGTH {
		errors.push(format!("Password must be at most {} characters in length", PASSWORD_MAX_LENGTH));
	}
	if !PASSWORD_REGEX.is_match(&password) {
		errors.push(format!("Password must contain numeric characters (0-9)"));
	}
	errors
}
