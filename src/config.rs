
use rocket::config::Environment;

pub struct AppConfig {
	pub recaptcha_public_key: String,
	pub recaptcha_private_key: String,
	pub github_webhook_secret: String,
}
impl AppConfig {
	pub fn load(env: Environment) -> AppConfig {
		if env.is_dev() {
			AppConfig {
				recaptcha_public_key: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI".to_string(),
				recaptcha_private_key: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe".to_string(),
				github_webhook_secret: String::new(),
			}
		} else {
			AppConfig {
				recaptcha_public_key: "6LfdxE8UAAAAAN1sVEiQVDVomnIyvz-Pa4FstoHT".to_string(),
				recaptcha_private_key: todo!("get recaptcha private key"),
				github_webhook_secret: todo!("get github webhook secret"),
			}
		}
	}
}
