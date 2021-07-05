use std::{borrow::Cow, collections::BTreeMap, path::PathBuf};
use std::time::Duration;

use anyhow::{Context, Result};
use rocket::config::Environment;
use serde::Deserialize;

const CONFIG_DEV_FILENAME: &'static str = "config_dev.toml";
const CONFIG_RELEASE_FILENAME: &'static str = "config_release.toml";

#[derive(Clone, Deserialize)]
pub struct DatabaseConfig {
	// Path of sqlite3 database file. Relative to the config file's location.
	#[serde(default = "default_database_path")]
	pub path: PathBuf,
	#[serde(default = "default_timeout")]
	#[serde(deserialize_with = "crate::util::serde::duration::deserialize")]
	pub timeout: Duration,
}

#[derive(Clone, Deserialize)]
pub struct RecaptchaConfig {
	pub public_key:  String,
	pub private_key: String,
}

#[derive(Clone, Deserialize)]
pub struct GithubWebhookConfig {
	/// GitHub shared secret key
	pub secret: String,
}

#[derive(Clone, Deserialize)]
pub struct GitLfsConfig {
	/// Directory holding LFS files. Relative to the config file's location.
	pub path: PathBuf,
}

#[derive(Clone, Deserialize)]
pub struct Config {
	/// Protocol that the server uses
	pub protocol:       String,
	/// Hostname of the server
	pub domain:         String,
	/// Log filepath. Relative to the config file's location.
	#[serde(default = "default_log_path")]
	pub log_path:       PathBuf,
	/// Secret key used by Rocket
	pub secret_key:     Option<String>,
	pub database:       DatabaseConfig,
	pub recaptcha:      RecaptchaConfig,
	/// File that is created when the server wants to restart. Relative to the config file's location.
	pub restart_flag_path: PathBuf,
	pub github_webhook: Option<GithubWebhookConfig>,
	#[serde(rename = "git-lfs")]
	pub git_lfs:        GitLfsConfig,
}
impl Config {
	pub fn load(env: Environment) -> Result<Config> {
		let exe_dir = match std::env::current_exe() {
			Ok(p) => p.parent().map(|p| p.to_path_buf()).unwrap_or_else(|| p.clone()),
			Err(e) => {
				warn!("executable directory could not be found: {}", e);
				".".into()
			}
		};

		// Get config dir
		let (config_dir, config): (PathBuf, Cow<'static, str>) = if env.is_dev() {
			std::fs::read_to_string(exe_dir.join(CONFIG_DEV_FILENAME))
				.map(|s| (exe_dir, s.into()))
				.or_else(|_| std::fs::read_to_string(CONFIG_DEV_FILENAME).map(|s| ("".into(), s.into())))
				.unwrap_or_else(|_| ("".into(), include_str!("../config_dev.toml").into()))
		} else {
			std::fs::read_to_string(exe_dir.join(CONFIG_RELEASE_FILENAME))
				.map(|s| (exe_dir, s.into()))
				.or_else(|_| std::fs::read_to_string(CONFIG_RELEASE_FILENAME).map(|s| ("".into(), s.into())))
				.context("Failed to read config_release.toml")?
		};

		// Parse config
		let mut config: Config = toml::from_str(&config).context("Failed to parse config")?;

		// Fix paths
		let fix_path = |path: &mut PathBuf| {
			if path.is_relative() {
				*path = config_dir.join(&path);
			}
		};
		fix_path(&mut config.database.path);
		fix_path(&mut config.git_lfs.path);
		fix_path(&mut config.log_path);
		fix_path(&mut config.restart_flag_path);

		Ok(config)
	}

	pub fn get_object_path(&self, owner: &str, name: &str, oid: &str) -> PathBuf {
		self.git_lfs.path.join(owner).join(name).join(oid)
	}
}

fn default_database_path() -> PathBuf { "data/db.sqlite3".into() }

fn default_log_path() -> PathBuf { "logs/rocket.debug.log".into() }

fn default_timeout() -> Duration { Duration::from_secs(60) }

pub fn get_configs() -> Result<(Config, rocket::Config, simplelog::Config)> {
	use rocket::config::Value;

	// Load config, based on environment
	let active_env = Environment::active().context("Invalid environment config")?;
	let config = Config::load(active_env).context("Failed to load config")?;

	// Setup db tables
	let db_url = config.database.path.to_string_lossy().to_string();
	let mut config_db_table = BTreeMap::<String, rocket::config::Value>::new();
	config_db_table.insert("url".into(), Value::String(db_url));
	let mut config_databases_db_table = BTreeMap::<String, rocket::config::Value>::new();
	config_databases_db_table.insert("db".into(), Value::Table(config_db_table));

	// Get default Rocket config
	let rocket_config = {
		let mut builder = rocket::Config::build(active_env)
			.log_level(rocket::logger::LoggingLevel::Normal)
			.extra("databases", Value::Table(config_databases_db_table));
		if let Some(secret_key) = &config.secret_key {
			builder = builder.secret_key(secret_key);
		}
		builder.finalize().context("Rocket config failed to parse")?
	};

	// Get simple log config
	let mut log_config_builder = simplelog::ConfigBuilder::new();
	log_config_builder.set_target_level(simplelog::LevelFilter::Error);
	let simplelog_config = if active_env.is_dev() {
		log_config_builder.set_time_to_local(true).set_time_format_str("%k:%M:%S.%3f").build()
	} else {
		log_config_builder.set_time_format_str("%Y-%m-%d %H:%M:%S.%9f").build()
	};

	Ok((config, rocket_config, simplelog_config))
}
