use chrono::{DateTime, Utc};
use std::collections::HashMap;

use crate::app::git_lfs::{Action, Config};
use crate::models::git_lfs as models;
use crate::db::{DbConn, DbResult};

#[derive(Clone, Debug, serde::Serialize)]
pub struct BatchResponse {
	pub transfer: String,
	pub objects:  Vec<ObjectSpec>,
}

#[derive(Clone, Debug, serde::Serialize)]
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

	pub fn from_upload_action(o: super::request::Object, action: ActionSpec) -> ObjectSpec {
		let mut actions = HashMap::new();
		actions.insert(Action::Upload, action);
		debug!("git lfs: from_upload_action: {:?}", actions);
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: Some(actions), error: None }
	}

	pub fn from_download_action(o: super::request::Object, action: ActionSpec) -> ObjectSpec {
		let mut actions = HashMap::new();
		actions.insert(Action::Download, action);
		ObjectSpec { oid: o.oid, size: o.size, authenticated: true, actions: Some(actions), error: None }
	}
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct ActionSpec {
	pub href:       String,
	#[serde(default)]
	pub header:     HashMap<String, String>,
	pub expires_in: u32,
	#[serde(with = "crate::util::serde_datetime")]
	pub expires_at: DateTime<Utc>,
}
impl ActionSpec {
	pub fn new_upload(conn: &DbConn, config: &Config, object: &models::Object) -> DbResult<ActionSpec> {
		let token = models::UploadToken::new(conn, object)?;
		Ok(ActionSpec {
			href:       format!("{}://{}/git-lfs/-/upload?token={}", config.protocol, config.hostname, token.token),
			header:     HashMap::new(),
			expires_in: models::UPLOAD_TOKEN_EXPIRATION_SECONDS,
			expires_at: DateTime::from_utc(token.expires, Utc),
		})
	}

	pub fn new_download(conn: &DbConn, config: &Config, object: &models::Object) -> DbResult<ActionSpec> {
		let token = models::DownloadToken::new(conn, object)?;
		Ok(ActionSpec {
			href:       format!("{}://{}/git-lfs/-/download?token={}", config.protocol, config.hostname, token.token),
			header:     HashMap::new(),
			expires_in: models::DOWNLOAD_TOKEN_EXPIRATION_SECONDS,
			expires_at: DateTime::from_utc(token.expires, Utc),
		})
	}
}

#[derive(Clone, Debug, serde::Serialize)]
pub struct ObjectError {
	pub code:    u16,
	pub message: String,
}
impl ObjectError {
	pub fn not_found() -> ObjectError { ObjectError { code: 404, message: "Object not found".into() } }

	pub fn too_large(size: u64) -> ObjectError {
		ObjectError { code: 413, message: format!("Requested size {} too large", size) }
	}

	pub fn db_error_msg(e: impl std::fmt::Debug) -> ObjectError {
		ObjectError { code: 500, message: format!("Database error: {:?}", e) }
	}
}

#[derive(Clone, serde::Serialize)]
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

#[derive(Clone, serde::Serialize)]
pub struct SuccessResponse {
	pub message: String,
}
impl SuccessResponse {
	pub fn new() -> SuccessResponse { SuccessResponse::custom("Success!".into()) }

	pub fn custom(message: String) -> SuccessResponse { SuccessResponse { message } }
}
