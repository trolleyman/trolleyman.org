use chrono::{DateTime, FixedOffset};
use std::collections::HashMap;

use super::Action;

#[derive(serde::Serialize)]
pub struct BatchResponse {
	pub transfer: String,
	pub objects:  Vec<ObjectSpec>,
}

#[derive(serde::Serialize)]
pub struct ObjectSpec {
	pub oid: String,
	pub size: usize,
	pub authenticated: bool,
	pub actions: Option<HashMap<Action, ActionSpec>>,
	pub error: Option<ObjectError>,
}

#[derive(serde::Serialize)]
pub struct ActionSpec {
	pub href:       String,
	#[serde(default)]
	pub header:     HashMap<String, String>,
	pub expires_in: usize,
	#[serde(with = "super::util::serde_datetime")]
	pub expires_at: DateTime<FixedOffset>,
}

#[derive(serde::Serialize)]
pub struct ObjectError {
	pub code:    u16,
	pub message: String,
}

#[derive(serde::Serialize)]
pub struct ErrorResponse {
	pub message: String,
	pub documentation_url: Option<String>,
	pub request_id: Option<String>,
}
impl ErrorResponse {
	pub fn new(message: impl ToString) -> ErrorResponse {
		ErrorResponse {
			message: message.to_string(),
			documentation_url: Some("https://git-lfs.github.com".into()),
			request_id: None,
		}
	}
}
