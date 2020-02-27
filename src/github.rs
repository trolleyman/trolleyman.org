use std::io::Read;

use anyhow::Context;
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

pub struct GithubHookPayload {
	event_name: String,
	payload:    serde_json::Value,
}
impl FromDataSimple for GithubHookPayload {
	type Error = anyhow::Error;

	fn from_data(req: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
		fn inner(req: &Request, data: Data) -> data::Outcome<GithubHookPayload, anyhow::Error> {
			// A push has been triggered
			// Get signature
			let header_signature = try_outcome!(req
				.headers()
				.get_one("X-Hub-Signature")
				.ok_or_else(|| anyhow!("X-Hub-Signature header not found"))
				.into_outcome(Status::BadRequest));

			let config = try_outcome!(req
				.guard::<State<Config>>()
				.success_or_else(|| anyhow!("Config could not be loaded"))
				.into_outcome(Status::InternalServerError));

			let secret = &try_outcome!(config
				.github_webhook
				.as_ref()
				.ok_or_else(|| anyhow!("Github secret not specified"))
				.into_outcome(Status::InternalServerError))
				.secret;

			let sig_split: Vec<_> = header_signature.split("=").collect();
			if sig_split.len() != 2 {
				return Outcome::Failure((Status::BadRequest, anyhow!("Invalid header")));
			}

			// Get signature
			let sha_name = sig_split[0];
			let signature = sig_split[1];
			if sha_name != "sha1" {
				return Outcome::Failure((Status::BadRequest, anyhow!("Hash algorithm not supported: {}", sha_name)));
			}

			// Read message
			let mut msg = String::new();
			try_outcome!(data
				.open()
				.take(MSG_LIMIT)
				.read_to_string(&mut msg)
				.context("IO error while reading")
				.into_outcome(Status::BadRequest));

			// Check HMAC
			let mut mac = try_outcome!(hmac::Hmac::<sha1::Sha1>::new_varkey(secret.as_bytes())
				.map_err(|e| anyhow!("HMAC error: {}", e))
				.into_outcome(Status::BadRequest));
			mac.input(msg.as_bytes());

			try_outcome!(mac
				.verify(signature.as_bytes())
				.map_err(|e| anyhow!("HMAC verify error: {}", e))
				.into_outcome(Status::BadRequest));

			// Setup payload
			let event_name = try_outcome!(req
				.headers()
				.get_one("X-GitHub-Event")
				.ok_or_else(|| anyhow!("X-GitHub-Event header not found"))
				.into_outcome(Status::BadRequest))
			.to_string();
			let payload = try_outcome!(serde_json::from_str(&msg)
				.context("Invalid JSON payload")
				.into_outcome(Status::BadRequest));

			Outcome::Success(GithubHookPayload { event_name, payload })
		}
		let ret = inner(req, data);
		if let data::Outcome::Failure(e) = &ret {
			eprintln!("Warning: error when creating github web hook: {}: {}", e.0, e.1);
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
					if let Some(github_webhook_config) = &config.github_webhook {
						// Write restart flag
						let path = &github_webhook_config.restart_flag_path;
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

