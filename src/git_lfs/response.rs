use crate::db::DbConn;
use chrono::{DateTime, FixedOffset};
use std::collections::HashMap;

use super::{models, Action};

#[derive(serde::Serialize)]
pub struct BatchResponse {
	pub transfer: String,
	pub objects:  Vec<ObjectSpec>,
}

#[derive(serde::Serialize)]
pub struct ObjectSpec {
	pub oid: String,
	pub size: u64,
	pub authenticated: bool,
	pub actions: Option<HashMap<Action, ActionSpec>>,
	pub error: Option<ObjectError>,
}
impl ObjectSpec {
	pub fn from_error(o: super::request::Object, error: ObjectError) -> ObjectSpec {
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: None, error: Some(error) }
	}

	pub fn already_uploaded(o: super::request::Object) -> ObjectSpec {
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: None, error: None }
	}

	pub fn from_actions(o: super::request::Object, actions: HashMap<Action, ActionSpec>) -> ObjectSpec {
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: Some(actions), error: None }
	}

	pub fn from_upload_action(o: super::request::Object, action: ActionSpec) -> ObjectSpec {
		let mut actions = HashMap::new();
		actions.insert(Action::Upload, action);
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: Some(actions), error: None }
	}
}

#[derive(serde::Serialize)]
pub struct ActionSpec {
	pub href:       String,
	#[serde(default)]
	pub header:     HashMap<String, String>,
	pub expires_in: u32,
	#[serde(with = "super::util::serde_datetime")]
	pub expires_at: DateTime<FixedOffset>,
}
impl ActionSpec {
	pub fn new_upload(conn: &DbConn, object: &models::Object) -> Result<ActionSpec, diesel::result::Error> {
		let token = models::UploadToken::new(conn, object)?;
		Ok(ActionSpec {
			href: todo!(),
			header: HashMap::new(),
			expires_in: todo!(),
			expires_at: todo!(),
		})
	}
}

#[derive(serde::Serialize)]
pub struct ObjectError {
	pub code:    u16,
	pub message: String,
}
impl ObjectError {
	pub fn not_found() -> ObjectError { ObjectError { code: 404, message: "Object not found".into() } }

	pub fn too_large(size: u64) -> ObjectError {
		ObjectError { code: 413, message: format!("Requested size {} too large", size) }
	}

	pub fn db_error() -> ObjectError { ObjectError { code: 500, message: "Database error".into() } }
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
