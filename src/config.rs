use std::{borrow::Cow, net::SocketAddr, path::PathBuf};

use anyhow::{Context, Result};
use rocket::config::Environment;
use serde::Deserialize;

const CONFIG_DEV_FILENAME: &'static str = "config_dev.toml";
const CONFIG_RELEASE_FILENAME: &'static str = "config_release.toml";

#[derive(Clone, Deserialize)]
pub struct RecaptchaConfig {
	pub public_key:  String,
	pub private_key: String,
}

#[derive(Clone, Deserialize)]
pub struct GithubWebhookConfig {
	/// GitHub shared secret key
	pub secret: String,
	/// File that is created when the server wants to restart. Relative to the config file's location.
	pub restart_flag_path: PathBuf,
}

#[derive(Clone, Deserialize)]
pub struct GitLfsConfig {
	/// Directory holding LFS files. Relative to the config file's location.
	pub path: PathBuf,
}

#[derive(Clone, Deserialize)]
pub struct FacebookGrpcConfig {
	/// Socket address of the gRPC server hosting the Facebook service
	#[serde(with = "crate::util::serde_socketaddr")]
	pub host: SocketAddr,
}

#[derive(Clone, Deserialize)]
pub struct Config {
	// Path of database. Relative to the config file's location.
	#[serde(default = "default_database_path")]
	pub database_path:  PathBuf,
	/// Protocol that the server uses
	pub protocol:       String,
	/// Hostname of the server
	pub hostname:       String,
	/// Log filepath. Relative to the config file's location.
	#[serde(default = "default_log_path")]
	pub log_path:       PathBuf,
	/// Secret key used by Rocket
	pub secret_key:     Option<String>,
	pub recaptcha:      RecaptchaConfig,
	pub github_webhook: Option<GithubWebhookConfig>,
	#[serde(rename = "git-lfs")]
	pub git_lfs:        GitLfsConfig,
	#[serde(rename = "facebook-grpc")]
	pub facebook_grpc: FacebookGrpcConfig,
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
		let mut config: Config = toml::from_str(&config).context("Failed to parse config")?;
		if config.database_path.is_relative() {
			config.database_path = config_dir.join(&config.database_path);
		}
		if config.git_lfs.path.is_relative() {
			config.git_lfs.path = config_dir.join(&config.git_lfs.path);
		}
		if config.log_path.is_relative() {
			config.log_path = config_dir.join(&config.log_path);
		}
		if let Some(github_webhook_config) = &mut config.github_webhook {
			github_webhook_config.restart_flag_path = config_dir.join(&github_webhook_config.restart_flag_path);
		}
		Ok(config)
	}

	pub fn get_object_path(&self, owner: &str, name: &str, oid: &str) -> PathBuf {
		self.git_lfs.path.join(owner).join(name).join(oid)
	}
}

fn default_database_path() -> PathBuf { "data/db.sqlite3".into() }

fn default_log_path() -> PathBuf { "logs/rocket.debug.log".into() }
