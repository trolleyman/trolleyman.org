use std::{convert::TryInto, fs::File, io::prelude::*};

use crate::config::Config;
use rocket::State;

use rocket_contrib::json::Json;

use rocket::{
	http::{ContentType, Status},
	response::status,
};

use crate::{
	db::DbConn,
	models::git_lfs::{DownloadToken, Repository, UploadToken},
};

mod request;
mod response;

use request::BatchRequest;
use response::{BatchResponse, ErrorResponse, SuccessResponse};

/// Max size of Git LFS objects (10 GiB)
pub const GIT_LFS_MAX_BYTES: u64 = 10 * 1024 * 1024 * 1024;

#[derive(serde::Deserialize, serde::Serialize, Debug, PartialEq, Eq, Hash, Copy, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Action {
	Download,
	Upload,
	// TODO: Verify
}

pub fn routes() -> Vec<rocket::Route> { routes![batch, upload, download] }

fn error_response(status: Status) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(status, Json(ErrorResponse::new(status.reason)))
}

fn error_response_db(e: impl std::fmt::Debug) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new(format!("Database connection error: {:?}", e))))
}

fn error_response_io(e: impl std::fmt::Debug) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new(format!("I/O error: {:?}", e))))
}

fn error_response_unauthorized() -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::Unauthorized, Json(ErrorResponse::new("Unauthorized")))
}

#[post("/<owner>/<repository_git>/info/lfs/objects/batch", data = "<req>")]
fn batch(
	owner: String,
	repository_git: String,
	req: BatchRequest,
	conn: DbConn,
	config: State<Config>,
) -> Result<Json<BatchResponse>, status::Custom<Json<ErrorResponse>>> {
	if !repository_git.ends_with(".git") {
		return Err(error_response(Status::NotFound));
	}

	// Get repo from database
	let repository = Repository::get(&conn, &owner, repository_git.trim_end_matches(".git"))
		.map_err(|e| error_response_db(e))?
		.ok_or_else(|| error_response(Status::NotFound))?;

	debug!("git lfs: batch: {}/{}", repository.owner, repository.name);

	// Auth (TODO: proper auth)
	let operation = req.operation;
	if operation == Action::Upload {
		warn!("git lfs: unathorized upload");
		return Err(error_response_unauthorized());
	}

	// Process request
	let batch_response = BatchResponse {
		transfer: "basic".into(),
		objects:  req
			.objects
			.into_iter()
			.map(|o| match operation {
				Action::Upload => create_upload_token(&conn, &*config, &repository, o),
				Action::Download => create_download_token(&conn, &*config, &repository, o),
			})
			.collect(),
	};
	debug!("git lfs: batch response: {:?}", batch_response);
	Ok(Json(batch_response))
}

fn create_upload_token(
	conn: &DbConn,
	config: &Config,
	repository: &Repository,
	o: request::Object,
) -> response::ObjectSpec {
	let orig_size = o.size;
	match repository.get_object(conn, &o.oid) {
		Ok(Some(object_model)) if object_model.valid => response::ObjectSpec::already_uploaded(o),
		Ok(o_opt) =>
			if let Ok(size) = o.size.try_into() {
				if orig_size > GIT_LFS_MAX_BYTES {
					response::ObjectSpec::from_error(o, response::ObjectError::too_large(orig_size))
				} else {
					o_opt
						.map(|o| Ok(o))
						.unwrap_or_else(|| repository.create_object(conn, &o.oid, size))
						.and_then(|o| response::ActionSpec::new_upload(conn, config, &o))
						.map(|action| response::ObjectSpec::from_upload_action(o.clone(), action))
						.unwrap_or_else(|e| response::ObjectSpec::from_error(o, response::ObjectError::db_error_msg(e)))
				}
			} else {
				response::ObjectSpec::from_error(o, response::ObjectError::too_large(orig_size))
			},
		Err(e) => response::ObjectSpec::from_error(o, response::ObjectError::db_error_msg(e)),
	}
}

#[put("/-/upload?<token>", data = "<data>")]
fn upload(
	token: String,
	conn: DbConn,
	config: State<Config>,
	data: rocket::Data,
) -> Result<Json<SuccessResponse>, status::Custom<Json<ErrorResponse>>> {
	let token = UploadToken::get(&conn, &token)
		.map_err(|e| error_response_db(e))?
		.ok_or_else(|| error_response(Status::NotFound))?;

	let object = token.get_object(&conn).map_err(|e| error_response_db(e))?;
	let repository = object.get_repository(&conn).map_err(|e| error_response_db(e))?;
	let owner = repository.get_owner(&conn).map_err(|e| error_response_db(e))?;

	let path = config.get_object_path(&owner.name, &repository.name, &object.oid);
	if let Some(parent) = path.parent() {
		std::fs::create_dir_all(&parent).map_err(|e| error_response_io(e))?;
	}
	let mut file = File::create(&path).map_err(|e| error_response_io(e))?;

	std::io::copy(&mut data.open().take(object.size as u64), &mut file).map_err(|e| error_response_io(e))?;

	object.make_valid(&conn).map_err(|e| error_response_db(e))?;

	Ok(Json(SuccessResponse::new()))
}

fn create_download_token(
	conn: &DbConn,
	config: &Config,
	repository: &Repository,
	o: request::Object,
) -> response::ObjectSpec {
	match repository.get_object(conn, &o.oid) {
		Ok(Some(object_model)) => response::ActionSpec::new_download(conn, config, &object_model)
			.map(|action| response::ObjectSpec::from_download_action(o.clone(), action))
			.unwrap_or_else(|e| response::ObjectSpec::from_error(o, response::ObjectError::db_error_msg(e))),
		Ok(None) => response::ObjectSpec::from_error(o, response::ObjectError::not_found()),
		Err(e) => response::ObjectSpec::from_error(o, response::ObjectError::db_error_msg(e)),
	}
}

#[get("/-/download?<token>")]
fn download(
	token: String,
	conn: DbConn,
	config: State<Config>,
) -> Result<rocket::response::Content<rocket::response::Stream<File>>, status::Custom<Json<ErrorResponse>>> {
	let token = DownloadToken::get(&conn, &token)
		.map_err(|e| error_response_db(e))?
		.ok_or_else(|| error_response(Status::NotFound))?;

	let object = token.get_object(&conn).map_err(|e| error_response_db(e))?;
	let repository = object.get_repository(&conn).map_err(|e| error_response_db(e))?;
	let owner = repository.get_owner(&conn).map_err(|e| error_response_db(e))?;

	let path = config.get_object_path(&owner.name, &repository.name, &object.oid);
	let file = File::open(path).map_err(|e| error_response_io(e))?;

	Ok(rocket::response::Content(ContentType::Binary, rocket::response::Stream::from(file)))
}
