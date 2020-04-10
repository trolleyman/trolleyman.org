use anyhow::Context;

use clap::{App, AppSettings, Arg, SubCommand};

use crate::{
	db::DbConn,
	error::Result,
	models::account::{Password, User},
};

mod util;

pub fn get_matches() -> clap::ArgMatches<'static> {
	let authors_string = env!("CARGO_PKG_AUTHORS").split(';').collect::<Vec<_>>().join(", ");
	let app = App::new(clap::crate_name!())
		.version(clap::crate_version!())
		.about(clap::crate_description!())
		.author(authors_string.as_ref())
		.setting(AppSettings::ColoredHelp)
		.setting(AppSettings::GlobalVersion)
		.setting(AppSettings::VersionlessSubcommands)
		.subcommand(
			SubCommand::with_name("database")
				.setting(AppSettings::ColoredHelp)
				.setting(AppSettings::DisableHelpSubcommand)
				.setting(AppSettings::SubcommandRequiredElseHelp)
				.about("Modifies the database")
				.subcommand(
					SubCommand::with_name("user-password-set")
						.setting(AppSettings::ColoredHelp)
						.setting(AppSettings::DisableHelpSubcommand)
						.about("Set the password of a specified user")
						.arg(Arg::with_name("username").required(true)),
				)
				.subcommand(
					SubCommand::with_name("user-admin-set")
						.setting(AppSettings::ColoredHelp)
						.setting(AppSettings::DisableHelpSubcommand)
						.about("Set the admin status of a specified user")
						.arg(Arg::with_name("username").required(true))
						.arg(Arg::with_name("is_admin")),
				)
				.subcommand(
					SubCommand::with_name("user-facebook-set")
						.setting(AppSettings::ColoredHelp)
						.setting(AppSettings::DisableHelpSubcommand)
						.about("Sets the facebook details for the specified user")
						.arg(Arg::with_name("username").required(true)),
				)
				.subcommand(
					SubCommand::with_name("user-view")
						.setting(AppSettings::ColoredHelp)
						.setting(AppSettings::DisableHelpSubcommand)
						.about("View the details of a specified user")
						.arg(Arg::with_name("username").required(true)),
				)
				.subcommand(
					SubCommand::with_name("user-create")
						.setting(AppSettings::ColoredHelp)
						.setting(AppSettings::DisableHelpSubcommand)
						.about("Create a new user"),
				),
		);

	app.get_matches()
}

pub fn perform_command(conn: &DbConn, matches: &clap::ArgMatches<'_>) -> Result<Option<i32>> {
	if let Some(matches) = matches.subcommand_matches("database") {
		if let Some(submatches) = matches.subcommand_matches("user-password-set") {
			let username = submatches.value_of("username").ok_or(anyhow!("Username/email not specified"))?;
			let mut user = crate::models::account::User::get_from_name_or_email(&conn, &username)?;

			info!("Getting password for {}.", username);
			let password = util::prompt_password()?;

			// Set password
			user.password = Password::from_password(&password);
			user.save(&conn)?;
			info!("Password updated for {}.", username);
			Ok(Some(0))
		} else if let Some(submatches) = matches.subcommand_matches("user-admin-set") {
			let username = submatches.value_of("username").ok_or(anyhow!("Username/email not specified"))?;
			let is_admin = submatches
			.value_of("is_admin")
			.map(|s| s.parse().context("is_admin is not a boolean"))
			.transpose()?
			.unwrap_or(true);
			
			// Set admin
			let mut user = crate::models::account::User::get_from_name_or_email(conn, &username)?;
			user.admin = is_admin;
			user.save(conn)?;
			info!("Admin status updated for {}: {}.", username, is_admin);
			Ok(Some(0))
		} else if let Some(submatches) = matches.subcommand_matches("user-facebook-set") {
			let username = submatches.value_of("username").ok_or(anyhow!("Username/email not specified"))?;
			let user = crate::models::account::User::get_from_name_or_email(&conn, &username)?;

			let facebook_email = util::prompt_email()?;
			let facebook_password = util::prompt_password()?;

			// Set facebook account
			if let Some(account) = crate::models::facebook::FacebookAccount::try_get_from_user_id(conn, user.id())? {
				account.delete(conn)?;
			}
			crate::models::facebook::FacebookAccount::create(conn, user.id(), &facebook_email, &facebook_password)?;
			info!("Facebook account {} registered with user {}", facebook_email, user.name);
			Ok(Some(0))
		} else if let Some(submatches) = matches.subcommand_matches("user-view") {
			let username = submatches.value_of("username").ok_or(anyhow!("Username/email not specified"))?;

			// Print details
			match crate::models::account::User::try_get_from_name_or_email(conn, &username)? {
				Some(user) => {
					info!("{:#?}", user);
					Ok(Some(0))
				}
				None => {
					info!("User '{}' not found", username);
					Ok(Some(1))
				}
			}
		} else if let Some(_) = matches.subcommand_matches("user-create") {
			let username = util::prompt_username(conn)?;
			let email = util::prompt_account_email(conn)?;
			let password = util::prompt_password()?;
			let admin = util::prompt_yn("Admin")?;

			let password = Password::from_password(&password);

			// Set email address & exit
			User::create(conn, &username, &email, &password, admin)?;
			info!("Created {} user {} ({}).", if admin { "admin" } else { "normal" }, username, password);
			Ok(Some(0))
		} else {
			error!("A subcommand must be specified when using `database`");
			Ok(Some(1))
		}
	} else {
		Ok(None)
	}
}
