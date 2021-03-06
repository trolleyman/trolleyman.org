use anyhow::{Context, Error};
use hmac::Mac;
use rocket::{
	data::{self, FromDataSimple},
	http::Status,
	outcome::IntoOutcome,
	Data, Outcome, Request, State,
};
use subtle::ConstantTimeEq;

use crate::{config::Config, util};

const MSG_LIMIT: usize = 32 * 1024;

pub fn routes() -> Vec<rocket::Route> { routes![push_hook] }

pub struct GithubHookPayload {
	event_name: String,
	payload:    serde_json::Value,
}
impl FromDataSimple for GithubHookPayload {
	type Error = Error;

	fn from_data(req: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
		fn inner(req: &Request, data: Data) -> data::Outcome<GithubHookPayload, Error> {
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
			let expected_signature = sig_split[1];
			if sha_name != "sha1" {
				return Outcome::Failure((Status::BadRequest, anyhow!("Hash algorithm not supported: {}", sha_name)));
			}
			let expected_signature = try_outcome!(hex::decode(expected_signature)
				.context("GitHub signature not in hex string format")
				.into_outcome(Status::BadRequest));
			debug!("GitHub signature: {}", hex::encode(&expected_signature));

			// Read message
			let msg = try_outcome!(util::read::read_limited_string(&mut data.open(), MSG_LIMIT)
				.context("IO error while reading")
				.into_outcome(Status::BadRequest));

			// Check HMAC
			let mut mac = try_outcome!(hmac::Hmac::<sha1::Sha1>::new_varkey(secret.as_bytes())
				.map_err(|e| anyhow!("HMAC error: {}", e))
				.into_outcome(Status::BadRequest));
			debug!("=== Start GitHub msg ===\n{}\n=== End GitHub msg ===", msg);
			mac.input(msg.as_bytes());

			let signature = mac.result().code();
			debug!("Calculated signature: {}", hex::encode(&signature));

			if signature.as_slice().ct_eq(&expected_signature).unwrap_u8() == 0 {
				return Outcome::Failure((Status::BadRequest, anyhow!("HMAC verify error")));
			}

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
			debug!("Warning: error when creating github web hook: {}: {:#}", e.0, e.1);
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
				Some("refs/heads/prod") => {
					// Write restart flag
					let path = &config.restart_flag_path;
					if let Some(parent) = path.parent() {
						std::fs::create_dir_all(parent)
							.map_err(|_| format!("Failed to create dir of restart flag"))?;
					}
					std::fs::write(path, b"please restart\n")
						.map_err(|_| format!("Failed to write restart flag"))?;
					info!("GitHub push webhook received. Wrote to restart flag file: {}", path.display());
					Ok("Thanks, git.".into())
				}
				Some(_) => Ok("Ignoring ref".into()),
				_ => Err("Invalid JSON".into()),
			}
		}
		_ => Err(format!("Unknown event '{}'", payload.event_name)),
	}
}
