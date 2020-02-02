
use std::borrow::Cow;
use std::path::PathBuf;

use rocket::config::Environment;
use serde::Deserialize;

const CONFIG_DEV_FILENAME: &'static str = "config_dev.toml";
const CONFIG_RELEASE_FILENAME: &'static str = "config_release.toml";

#[derive(Clone, Deserialize)]
pub struct RecaptchaConfig {
	pub public_key: String,
	pub private_key: String,
}

#[derive(Clone, Deserialize)]
pub struct GithubWebhookConfig {
	pub secret: Option<String>,
	pub restart_flag_path: Option<String>,
}

#[derive(Clone, Deserialize)]
pub struct Config {
	// Path of database. Relative to the config file's location.
	#[serde(default = "default_database_path")]
	pub database_path: PathBuf,
	/// Secret key used by Rocket
	pub secret_key: Option<String>,
	pub recaptcha: RecaptchaConfig,
	pub github_webhook: GithubWebhookConfig,
}
impl Config {
	pub fn load(env: Environment) -> Config {
		let exe_dir = match std::env::current_exe() {
			Ok(p) => p.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| p.clone()),
			Err(e) => {
				eprintln!("{}executable directory could not be found: {}", super::WARN_PREFIX, e);
				".".into()
			}
		};
		let (config_dir, config): (PathBuf, Cow<'static, str>) = if env.is_dev() {
			std::fs::read_to_string(exe_dir.join(CONFIG_DEV_FILENAME)).map(|s| (exe_dir, s.into()))
				.or_else(|_| std::fs::read_to_string(CONFIG_DEV_FILENAME).map(|s| ("".into(), s.into())))
				.unwrap_or_else(|_| ("".into(), include_str!("../config_dev.toml").into()))
		} else {
			std::fs::read_to_string(exe_dir.join(CONFIG_RELEASE_FILENAME)).map(|s| (exe_dir, s.into()))
				.or_else(|_| std::fs::read_to_string(CONFIG_RELEASE_FILENAME).map(|s| ("".into(), s.into())))
				.expect("Failed to read config_release.toml")
		};
		let mut config: Config = toml::from_str(&config).expect("Failed to parse config");
		if config.database_path.is_relative() {
			config.database_path = config_dir.join(&config.database_path);
		}
		config
	}
}

fn default_database_path() -> PathBuf {
	"database/db.sqlite".into()
}
