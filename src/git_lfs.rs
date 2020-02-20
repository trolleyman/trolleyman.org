use crate::config::Config;
use rocket::State;
use diesel::prelude::*;

use rocket_contrib::json::Json;

use rocket::{
	http::{Accept, MediaType, QMediaType, Status},
	response::status,
};

use crate::DbConn;

mod models;
mod request;
mod response;
mod util;

use models::Repository;
use request::BatchRequest;
use response::{BatchResponse, ErrorResponse};

#[derive(serde::Deserialize, serde::Serialize, PartialEq, Eq, Hash, Copy, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Action {
	Download,
	Upload,
}

pub fn routes() -> Vec<rocket::Route> { routes![batch] }

fn error_response(status: Status) -> status::Custom<Json<ErrorResponse>> {
	status::Custom(status, Json(ErrorResponse::new(status.reason)))
}

fn error_response_db() -> status::Custom<Json<ErrorResponse>> {
	status::Custom(Status::InternalServerError, Json(ErrorResponse::new("Database connection error")))
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
	let repository = Repository::get(conn, &owner, repository_git.trim_end_matches(".git"))
		.map_err(|_| error_response_db())?
		.ok_or_else(|| error_response(Status::NotFound))?;

	// TODO auth

	// Process request
	match req.operation {
		Action::Upload => todo!(),
		Action::Download => todo!(),
	}
}
