use std::{io::Read, path::Path};

use hmac::Mac;
use rocket::{
	data::{self, FromDataSimple},
	http::Status,
	outcome::IntoOutcome,
	Data, Outcome, Request, State,
};

use super::config::Config;

const MSG_LIMIT: u64 = 10 * 1024;

pub fn routes() -> Vec<rocket::Route> { routes![push_hook] }

#[derive(Debug)]
pub enum GithubHookError {
	NonexistentHeader,
	InvalidHeader,
	ConfigLoad,
	OperationNotSupported,
	IoError,
	HmacError,
	InvalidJson,
}

pub struct GithubHookPayload {
	event_name: String,
	payload:    serde_json::Value,
}
impl FromDataSimple for GithubHookPayload {
	type Error = GithubHookError;

	fn from_data(req: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
		fn inner(req: &Request, data: Data) -> data::Outcome<GithubHookPayload, GithubHookError> {
			// A push has been triggered
			// Get signature
			let header_signature = try_outcome!(req
				.headers()
				.get_one("X-Hub-Signature")
				.ok_or(GithubHookError::NonexistentHeader)
				.into_outcome(Status::BadRequest));

			let config = try_outcome!(req
				.guard::<State<Config>>()
				.success_or(GithubHookError::ConfigLoad)
				.into_outcome(Status::InternalServerError));

			let secret = try_outcome!(config
				.github_webhook
				.secret
				.as_ref()
				.ok_or(GithubHookError::ConfigLoad)
				.into_outcome(Status::InternalServerError))
			.clone();

			let sig_split: Vec<_> = header_signature.split("=").collect();
			if sig_split.len() != 2 {
				return Outcome::Failure((Status::BadRequest, GithubHookError::InvalidHeader));
			}

			// Get signature
			let sha_name = sig_split[0];
			let signature = sig_split[1];
			if sha_name != "sha1" {
				return Outcome::Failure((Status::BadRequest, GithubHookError::OperationNotSupported));
			}

			// Read message
			let mut msg = String::new();
			try_outcome!(data
				.open()
				.take(MSG_LIMIT)
				.read_to_string(&mut msg)
				.map_err(|_| GithubHookError::IoError)
				.into_outcome(Status::BadRequest));

			// Check HMAC
			let mut mac = try_outcome!(hmac::Hmac::<sha1::Sha1>::new_varkey(secret.as_bytes())
				.map_err(|_| GithubHookError::HmacError)
				.into_outcome(Status::BadRequest));
			mac.input(msg.as_bytes());

			try_outcome!(mac
				.verify(signature.as_bytes())
				.map_err(|_| GithubHookError::HmacError)
				.into_outcome(Status::BadRequest));

			// Setup payload
			let event_name = try_outcome!(req
				.headers()
				.get_one("X-GitHub-Event")
				.ok_or(GithubHookError::NonexistentHeader)
				.into_outcome(Status::BadRequest))
			.to_string();
			let payload = try_outcome!(serde_json::from_str(&msg)
				.map_err(|_| GithubHookError::InvalidJson)
				.into_outcome(Status::BadRequest));

			Outcome::Success(GithubHookPayload { event_name, payload })
		}
		let ret = inner(req, data);
		if let data::Outcome::Failure(e) = &ret {
			eprintln!("Warning: error when creating github web hook: {:?}", e);
		}
		ret
	}
}

#[post("/push", data = "<payload>")]
fn push_hook(payload: GithubHookPayload, config: State<Config>) -> Result<String, String> {
	match payload.event_name.as_ref() {
		"ping" => Ok("pong".to_string()),
		"push" => {
			let push_ref = payload.payload.get("ref").and_then(|r| r.as_str());
			match push_ref {
				Some("ref/heads/prod") => {
					// Update server
					if let Some(path) = config.github_webhook.restart_flag_path.as_ref() {
						// Write restart flag
						let path = Path::new(path);
						if let Some(parent) = path.parent() {
							std::fs::create_dir_all(parent)
								.map_err(|_| format!("Failed to create dir of restart flag"))?;
						}
						std::fs::write(path, b"please restart").map_err(|_| format!("Failed to write restart flag"))?;
					} else {
						eprintln!("Warning: restart flag config item not found");
					}

					Ok("Thanks, git.".to_string())
				}
				Some(_) => Ok("Ignoring ref".to_string()),
				_ => Err("Invalid JSON".to_string()),
			}
		}
		_ => Err(format!("Unknown event '{}'", payload.event_name)),
	}
}
