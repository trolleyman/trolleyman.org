use crate::{db::DbConn, error::Result};

pub fn prompt_yn(prompt: &str) -> Result<bool> {
	let reply = rprompt::prompt_reply_stderr(&format!("{} [y/n]? ", prompt))?;
	Ok(reply.trim().to_lowercase() == "y")
}

fn prompt_property<F>(name: &str, password: bool, get_validation_errors: F) -> Result<String>
where
	F: Fn(&str) -> Result<Vec<String>>,
{
	loop {
		let property = if password {
			rpassword::prompt_password_stderr(&format!("{}: ", name))?
		} else {
			rprompt::prompt_reply_stderr(&format!("{}: ", name))?
		};
		let errors = get_validation_errors(&property)?;
		if errors.len() > 0 {
			println!("{} validation error{}:", name, if errors.len() == 1 { "" } else { "s" });
			for error in errors {
				println!("\t- {}", error);
			}
			if !prompt_yn("Force")? {
				continue;
			}
		}
		break Ok(property);
	}
}

pub fn prompt_username(conn: &DbConn) -> Result<String> {
	prompt_property("Username", false, |username| crate::app::account::validation::get_errors_for_username(conn, &username))
}

pub fn prompt_password() -> Result<String> {
	prompt_property("Password", true, |password| Ok(crate::app::account::validation::get_errors_for_password(&password)))
}

pub fn prompt_email(conn: &DbConn) -> Result<String> {
	prompt_property("Email address", false, |email| crate::app::account::validation::get_errors_for_email(conn, &email))
}
