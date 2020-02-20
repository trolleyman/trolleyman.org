use diesel::prelude::*;

use rocket_contrib::json::Json;

use rocket::{
	http::Status, response::status
};

use crate::DbConn;

mod models;
mod response;
mod request;
mod util;

use request::BatchRequest;
use response::{BatchResponse, ErrorResponse};
use models::Repository;

pub fn routes() -> Vec<rocket::Route> { routes![batch] }

fn error_response(status: Status) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(status, Json(ErrorResponse::new(status.reason.into())))
}

fn error_response_db() -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new("Database connection error".into())))
}

#[get("/<owner>/<repository_git>/info/lfs/objects/batch")]
fn batch(owner: String, repository_git: String, req: BatchRequest conn: DbConn) -> Result<Json<BatchResponse>, status::Custom<Json<ErrorResponse>>> {
	if !repository_git.ends_with(".git") {
		return Err(error_response(Status::NotFound));
	}

	let repository = Repository::get(conn, &owner, repository_git.trim_end_matches(".git"))
		.map_err(|_| error_response_db())?
		.ok_or_else(|| error_response(Status::NotFound))?;

	todo!()
}
