use anyhow::Error;
use rocket::{
	http::Status,
	outcome::IntoOutcome,
	request::{FromRequest, Outcome},
	Request, State,
};

use crate::config::Config;

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
			let response_token = req
				.headers()
				.get_one("g-recaptcha-response")
				.ok_or((Status::BadRequest, anyhow!("G-Recaptcha-Response header not found")))?;

			let private_key = &req
				.guard::<State<Config>>()
				.success_or((Status::InternalServerError, anyhow!("Config failed to load")))?
				.recaptcha
				.private_key;

			let mut data = url::form_urlencoded::Serializer::new(String::new());
			data.append_pair("secret", &private_key);
			data.append_pair("response", &response_token);
			if let Some(client_ip) = req.client_ip() {
				data.append_pair("remoteip", &client_ip.to_string());
			}
			let data = data.finish();

			// Request from Google's servers
			let client = reqwest::blocking::Client::new();
			let response = client
				.post(RECAPTCHA_VERIFY_URL)
				.header(reqwest::header::CONTENT_TYPE, "application/x-www-form-urlencoded")
				.header(reqwest::header::ACCEPT, "application/json")
				.body(data.to_string())
				.send()
				.and_then(|res| res.text())
				.map_err(|e| {
					(
						Status::InternalServerError,
						Error::new(e).context(format!("Failed to request {}", RECAPTCHA_VERIFY_URL)),
					)
				})?;

			// Parse request
			let json = response
				.parse::<serde_json::Value>()
				.map_err(|e| {
					(
						Status::InternalServerError,
						Error::new(e).context(format!("Failed to request {}", RECAPTCHA_VERIFY_URL)),
					)
				})?;
			let success: bool = json
				.as_object()
				.and_then(|o| o.get("success").map(|v| v.as_bool().unwrap_or(false)))
				.ok_or_else(|| (Status::InternalServerError, anyhow!("Failed to request {}", RECAPTCHA_VERIFY_URL)))?;

			if !success {
				Err((Status::Unauthorized, anyhow!("Invalid client request (success=false from Google): received: {}", json)))
			} else {
				Ok(())
			}
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
