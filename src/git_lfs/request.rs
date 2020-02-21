use rocket_contrib::json::Json;
use std::io::Read;

use rocket::{
	data::{self, FromDataSimple},
	http::{ContentType, Status},
	outcome::IntoOutcome,
	Data, Outcome, Request,
};

use super::{response::ErrorResponse, Action};

#[derive(serde::Deserialize)]
struct BatchRequestSpec {
	operation: Action,
	transfers: Vec<String>,
	reference: Option<RefSpec>,
	objects:   Vec<ObjectSpec>,
}

#[derive(serde::Deserialize)]
struct RefSpec {
	name: String,
}

#[derive(serde::Deserialize)]
struct ObjectSpec {
	oid:  String,
	size: usize,
}

pub struct Object {
	pub oid:  String,
	pub size: usize,
}
impl From<ObjectSpec> for Object {
	fn from(object: ObjectSpec) -> Object { Object { oid: object.oid, size: object.size } }
}

pub struct BatchRequest {
	pub operation: Action,
	pub reference: Option<String>,
	pub objects:   Vec<Object>,
}
impl FromDataSimple for BatchRequest {
	type Error = Json<ErrorResponse>;

	fn from_data(req: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
		let git_lfs_ct = ContentType::new("application", "vnd.git-lfs+json");
		if req.content_type() != Some(&git_lfs_ct) {
			return Outcome::Failure((Status::NotAcceptable, Json(ErrorResponse::new("Invalid content type"))));
		}

		// TODO: Check Accept header

		let mut data_str = String::new();
		try_outcome!(data
			.open()
			.read_to_string(&mut data_str)
			.map_err(|_| Json(ErrorResponse::new("Invalid UTF8")))
			.into_outcome(Status::BadRequest));

		let spec: BatchRequestSpec = try_outcome!(serde_json::from_str(&data_str)
			.map_err(|_| Json(ErrorResponse::new("Invalid JSON")))
			.into_outcome(Status::BadRequest));

		if !spec.transfers.iter().any(|t| t == "basic") {
			return Outcome::Failure((
				Status::BadRequest,
				Json(ErrorResponse::new("Unsupported transfer adapter (only basic supported)")),
			));
		}

		Outcome::Success(BatchRequest {
			operation: spec.operation,
			reference: spec.reference.map(|r| r.name),
			objects:   spec.objects.into_iter().map(|o| o.into()).collect(),
		})
	}
}
