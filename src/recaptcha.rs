
use rocket::State;
use rocket::Request;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome};
use rocket::outcome::IntoOutcome;

use super::config::Config;


const RECAPTCHA_VERIFY_URL: &'static str = "https://www.google.com/recaptcha/api/siteverify";


#[derive(Debug)]
pub enum ReCaptchaError {
	NonexistentHeader,
	ConfigLoad,
	VerifyError(reqwest::Error),
}

pub struct ReCaptchaGuard {
	// Here to ensure that this type is never constructible from outside this module
	_phantom_data: std::marker::PhantomData<()>
}
impl<'a, 'r> FromRequest<'a, 'r> for ReCaptchaGuard {
	type Error = ReCaptchaError;
	fn from_request(req: &'a Request<'r>) -> Outcome<Self, Self::Error> {
		// Check if g-recaptcha-response is valid.
		let token = try_outcome!(req.headers().get_one("g-recaptcha-response")
			.ok_or(ReCaptchaError::NonexistentHeader)
			.into_outcome(Status::BadRequest));

		let private_key = &try_outcome!(req.guard::<State<Config>>().map_failure(|(status, _)| (status, ReCaptchaError::ConfigLoad))).recaptcha.private_key;
		let mut data = json!({
			"secret": private_key,
			"token": token,
		});
		if let Some(client_ip) = req.client_ip() {
			data.as_object_mut().unwrap().insert("remoteip".to_string(), serde_json::Value::String(client_ip.to_string()));
		}

		let client = reqwest::blocking::Client::new();
		let result = client.post(RECAPTCHA_VERIFY_URL)
			.header(reqwest::header::CONTENT_TYPE, "application/json")
			.header(reqwest::header::ACCEPT, "application/json")
			.body(data.to_string())
			.send();

		match result {
			Ok(_) => Outcome::Success(ReCaptchaGuard{_phantom_data: std::marker::PhantomData}),
			Err(e) => Outcome::Failure((Status::InternalServerError, ReCaptchaError::VerifyError(e))),
		}
	}
}
