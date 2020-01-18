
use rocket::config::Environment;

pub struct AppConfig {
	pub recaptcha_public_key: String,
	pub recaptcha_private_key: String,
}
impl AppConfig {
	pub fn load(env: Environment) -> AppConfig {
		if env.is_dev() {
			AppConfig {
				recaptcha_public_key: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI".to_string(),
				recaptcha_private_key: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe".to_string(),
			}
		} else {
			todo!("Implement config loading (maybe from .env files)")
		}
	}
}
