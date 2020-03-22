use anyhow::Error;
use rocket::{
	http::Status,
	outcome::IntoOutcome,
	request::{FromRequest, Outcome},
	Request, State,
};

use super::config::Config;

const RECAPTCHA_VERIFY_URL: &'static str = "https://www.google.com/recaptcha/api/siteverify";

pub struct ReCaptchaGuard {
	// Here to ensure that this type is never constructible from outside this module
	_phantom_data: std::marker::PhantomData<()>,
}

impl<'a, 'r> FromRequest<'a, 'r> for ReCaptchaGuard {
	type Error = Error;

	fn from_request(req: &'a Request<'r>) -> Outcome<Self, Error> {
		fn process(req: &'_ Request<'_>) -> Result<(), (Status, Error)> {
			// Check if g-recaptcha-response is valid.
			let token = req
				.headers()
				.get_one("g-recaptcha-response")
				.ok_or((Status::BadRequest, anyhow!("G-Recaptcha-Response header not found")))?;

			let private_key = &req
				.guard::<State<Config>>()
				.success_or((Status::InternalServerError, anyhow!("Config failed to load")))?
				.recaptcha
				.private_key;
			let mut data = json!({
				"secret": private_key,
				"token": token,
			});
			if let Some(client_ip) = req.client_ip() {
				data.as_object_mut()
					.unwrap()
					.insert("remoteip".to_string(), serde_json::Value::String(client_ip.to_string()));
			}

			let client = reqwest::blocking::Client::new();
			client
				.post(RECAPTCHA_VERIFY_URL)
				.header(reqwest::header::CONTENT_TYPE, "application/json")
				.header(reqwest::header::ACCEPT, "application/json")
				.body(data.to_string())
				.send()
				.map(|_| ())
				.map_err(|e| {
					(
						Status::InternalServerError,
						Error::new(e).context(format!("Failed to request {}", RECAPTCHA_VERIFY_URL)),
					)
				})
		}

		match process(req) {
			Ok(()) => Outcome::Success(ReCaptchaGuard { _phantom_data: std::marker::PhantomData }),
			Err((status, e)) => {
				warn!("ReCAPTCHA failed: {:#}", e);
				Err(e).into_outcome(status)
			}
		}
	}
}
