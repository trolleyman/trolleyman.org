use std::io::Read;

use rocket::{
	data::{self, FromDataSimple},
	http::{ContentType, Status},
	outcome::IntoOutcome,
	Data, Outcome, Request,
};

use rocket_contrib::json::Json;

use super::{response::ErrorResponse, Action};

#[derive(Clone, Debug, serde::Deserialize)]
struct BatchRequestSpec {
	operation: Action,
	#[serde(default)]
	transfers: Vec<String>,
	reference: Option<RefSpec>,
	objects:   Vec<ObjectSpec>,
}

#[derive(Clone, Debug, serde::Deserialize)]
struct RefSpec {
	name: String,
}

#[derive(Clone, Debug, serde::Deserialize)]
struct ObjectSpec {
	oid:  String,
	size: u64,
}

#[derive(Clone)]
pub struct Object {
	pub oid:  String,
	pub size: u64,
}
impl From<ObjectSpec> for Object {
	fn from(object: ObjectSpec) -> Object { Object { oid: object.oid, size: object.size } }
}

#[derive(Clone)]
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
			
		if spec.transfers.len() != 0 && !spec.transfers.iter().any(|t| t == "basic") {
			return Outcome::Failure((
				Status::BadRequest,
				Json(ErrorResponse::new("Unsupported transfer adapter (only basic supported)")),
			));
		}
		
		eprintln!("git lfs: batch request: {:?}", &spec);
		Outcome::Success(BatchRequest {
			operation: spec.operation,
			reference: spec.reference.map(|r| r.name),
			objects:   spec.objects.into_iter().map(|o| o.into()).collect(),
		})
	}
}
