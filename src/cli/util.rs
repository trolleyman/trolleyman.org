use crate::{db::DbConn, error::Result};

pub fn prompt_yn(prompt: &str) -> Result<bool> {
	let reply = rprompt::prompt_reply_stderr(&format!("{} [y/n]? ", prompt))?;
	Ok(reply.trim().to_lowercase() == "y")
}

fn prompt_property<F>(name: &str, password: bool, allow_force: bool, get_validation_errors: F) -> Result<String>
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
			for error in &errors {
				println!("\t- {}", error);
			}
			if allow_force {
				if !prompt_yn("Force")? {
					continue;
				}
			} else {
				break Err(anyhow!("Validation errors: {}", errors.join(", ")).into());
			}
		}
		break Ok(property);
	}
}

pub fn prompt_username(conn: &DbConn) -> Result<String> {
	prompt_property("Username", false, true, |username| {
		crate::app::account::validation::get_errors_for_username(conn, &username)
	})
}

pub fn prompt_password() -> Result<String> {
	loop {
		let password = prompt_property("Password", true, true, |password| {
			Ok(crate::app::account::validation::get_errors_for_password(&password))
		})?;
		match prompt_property("Confirm password", true, false, |s| {
			if s != password {
				Ok(vec!["Entered passwords must match".into()])
			} else {
				Ok(vec![])
			}
		}) {
			Ok(_) => {}
			Err(_) =>
				if prompt_yn("Retry")? {
					continue;
				},
		}
		break Ok(password);
	}
}

pub fn prompt_email(conn: &DbConn) -> Result<String> {
	prompt_property("Email address", false, true, |email| {
		crate::app::account::validation::get_errors_for_email(conn, &email)
	})
}
