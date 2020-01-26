
use std::borrow::Cow;

use rocket::config::Environment;
use serde::Deserialize;

#[derive(Clone, Deserialize)]
pub struct RecaptchaConfig {
	pub public_key: String,
	pub private_key: String,
}

#[derive(Clone, Deserialize)]
pub struct GithubWebhookConfig {
	pub secret: String,
}

#[derive(Clone, Deserialize)]
pub struct Config {
	pub recaptcha: RecaptchaConfig,
	pub github_webhook: Option<GithubWebhookConfig>,
}
impl Config {
	pub fn load(env: Environment) -> Config {
		let config: Cow<'static, str> = if env.is_dev() {
			std::fs::read_to_string("config_dev.toml").map(|s| s.into()).unwrap_or(include_str!("../config_dev.toml").into())
		} else {
			std::fs::read_to_string("config_release.toml").expect("Failed to read config_release.toml").into()
		};
		toml::from_str(&config).expect("Failed to parse config")
	}
}
