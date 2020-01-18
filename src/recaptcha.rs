
use rocket::State;
use rocket::Request;
use rocket::http::Status;
use rocket::request::{self, FromRequest};
use rocket::outcome::IntoOutcome;

use super::config::AppConfig;


const RECAPTCHA_VERIFY_URL: &'static str = "https://www.google.com/recaptcha/api/siteverify";


#[derive(Debug)]
pub enum ReCaptchaError {
	NonexistentHeader,
}

pub struct ReCaptchaGuard(String);
impl<'a, 'r> FromRequest<'a, 'r> for ReCaptchaGuard {
	type Error = ReCaptchaError;
	fn from_request(req: &'a Request<'r>) -> request::Outcome<Self, Self::Error> {
		// Check if g-recaptcha-response is valid.
		let token = req.headers().get_one("G_RECAPTCHA_RESPONSE")
			.ok_or(ReCaptchaError::NonexistentHeader)
			.into_outcome(Status::BadRequest)?;

		let private_key = req.guard::<State<AppConfig>>().recaptcha_private_key;
		let data = json!({
			"secret": private_key,
			"token": token,
		});
		data.as_object_mut().unwrap().insert("remoteip".to_string(), serde_json::Value::String(remote_ip));
		
		// data = {
		//     'secret': settings.RECAPTCHA_PRIVATE_KEY,
		//     'response': token,
		// }
		// try:
		//     data['remoteip'] = request.META['HTTP_REMOTE_ADDR']
		// except KeyError:
		//     pass  # Ignore
	
		// r = requests.post(url, data=data)
		// if r.status_code >= 200 and r.status_code < 300:
		//     return render(request, 'homepage/contact_details.html', {
		//         'sitekey': settings.RECAPTCHA_PUBLIC_KEY
		//     })
	
		// else:
		// 	return error400_bad_request(request, 'RECAPTCHA error: ' + r.text)
		
		Ok(ReCaptchaGuard(format!("")))
	}
}
