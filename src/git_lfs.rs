use std::convert::TryInto;
use std::io::prelude::*;
use std::fs::File;

use crate::config::Config;
use rocket::State;

use rocket_contrib::json::Json;

use rocket::{http::Status, response::status};

use crate::DbConn;

mod models;
mod request;
mod response;
mod util;

use models::{UploadToken, Repository};
use request::BatchRequest;
use response::{BatchResponse, ErrorResponse, SuccessResponse};

#[derive(serde::Deserialize, serde::Serialize, PartialEq, Eq, Hash, Copy, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Action {
	Download,
	Upload,
}

pub fn routes() -> Vec<rocket::Route> { routes![batch, upload] }

fn error_response(status: Status) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(status, Json(ErrorResponse::new(status.reason)))
}

fn error_response_db() -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new("Database connection error")))
}

fn error_response_io() -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new("I/O error")))
}

#[post("/<owner>/<repository_git>/info/lfs/objects/batch", data = "<req>")]
fn batch(
	owner: String,
	repository_git: String,
	req: BatchRequest,
	conn: DbConn,
) -> Result<Json<BatchResponse>, status::Custom<Json<ErrorResponse>>> {
	if !repository_git.ends_with(".git") {
		return Err(error_response(Status::NotFound));
	}

	// Get repo from database
	let repository = Repository::get(&conn, &owner, repository_git.trim_end_matches(".git"))
		.map_err(|_| error_response_db())?
		.ok_or_else(|| error_response(Status::NotFound))?;

	// TODO auth

	// Process request
	match req.operation {
		Action::Upload => Ok(Json(BatchResponse {
			transfer: "basic".into(),
			objects:  req.objects.into_iter().map(|o| create_upload_token(&conn, &repository, o)).collect(),
		})),
		Action::Download => todo!(),
	}
}

fn create_upload_token(conn: &DbConn, repository: &Repository, o: request::Object) -> response::ObjectSpec {
	match repository.get_object(conn, &o.oid) {
		Ok(Some(_)) => response::ObjectSpec::already_uploaded(o),
		Ok(None) =>
			if let Ok(size) = o.size.try_into() {
				repository.create_object(conn, &o.oid, size)
					.and_then(|o| response::ActionSpec::new_upload(conn, &o))
					.map(|action| response::ObjectSpec::from_upload_action(o.clone(), action))
					.unwrap_or_else(|_| response::ObjectSpec::from_error(o, response::ObjectError::db_error()))
			} else {
				let orig_size = o.size;
				response::ObjectSpec::from_error(o, response::ObjectError::too_large(orig_size))
			},
		Err(_) => response::ObjectSpec::from_error(o, response::ObjectError::db_error()),
	}
}

#[post("/-/upload?<token>", data = "<data>")]
fn upload(token: String, conn: DbConn, config: State<Config>, data: rocket::Data) -> Result<Json<SuccessResponse>, status::Custom<Json<ErrorResponse>>> {
	let token = UploadToken::get(&conn, &token)
		.map_err(|_| error_response_db())?
		.ok_or_else(|| error_response(Status::NotFound))?;

	let object = token.get_object(&conn)
		.map_err(|_| error_response_db())?;
	let repository = object.get_repository(&conn)
		.map_err(|_| error_response_db())?;

	let path = config.get_object_path(&repository.owner, &repository.name, &object.oid);
	let mut file = File::create(path)
		.map_err(|_| error_response_io())?;

	std::io::copy(&mut data.open().take(object.size as u64), &mut file)
		.map_err(|_| error_response_io())?;

	Ok(Json(SuccessResponse::new()))
}
