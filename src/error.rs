use rocket::{
	config::Environment,
	http::{ContentType, Status},
	response::{self, content, Responder},
	Request, State,
};
use rocket_contrib::templates::Template;

pub type Result<T, E = Error> = std::result::Result<T, E>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
	#[error("{0}")]
	NotFound(String),
	#[error("An input/output error occured")]
	Io(#[from] std::io::Error),
	#[error("A database error occured")]
	Db(#[from] crate::db::DbError),
	#[error(transparent)]
	Other(#[from] anyhow::Error),
}
impl Responder<'_> for Error {
	fn respond_to(self, request: &Request) -> response::Result<'static> {
		let is_dev = request.guard::<State<Environment>>().map(|f| f.is_dev()).succeeded().unwrap_or(false);
		match self {
			// TODO: When in debug mode, print out database error inner details
			Error::NotFound(msg) => error_response(request, Status::NotFound, &msg),
			Error::Io(inner) => {
				let msg = if is_dev {
					format!("There was an input/output error: {:?}", inner)
				} else {
					"There was an input/output error.".into()
				};
				error_response(request, Status::InternalServerError, &msg)
			},
			Error::Db(inner) => {
				let msg = if is_dev {
					format!("There was a database error: {:?}", inner)
				} else {
					"There was a database error.".into()
				};
				error_response(request, Status::InternalServerError, &msg)
			}
			Error::Other(inner) => {
				let msg =
					if is_dev { format!("{:?}", inner) } else { "There was an unknown internal server error.".into() };
				error_response(request, Status::InternalServerError, &msg)
			}
		}
	}
}

fn error_response(request: &Request, status: Status, msg: &str) -> response::Result<'static> {
	let mut response = match request.content_type() {
		Some(ty) if ty == &ContentType::JSON => content::Json(
			json!({
				"success": false,
				"error": true,
				"status": status.code,
				"reason": status.reason,
				"msg": msg,
			})
			.to_string(),
		)
		.respond_to(request)?,
		_ => Template::render(
			"error",
			json!({
				"status": status.code,
				"title": status.reason,
				"msg": msg,
			}),
		)
		.respond_to(request)?,
	};
	response.set_status(status);
	Ok(response)
}
