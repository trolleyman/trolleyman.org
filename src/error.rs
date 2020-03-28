use rocket::{
	config::Environment,
	http::{ContentType, Status},
	response::{self, content, Responder},
	Request, State,
};
use rocket_contrib::templates::Template;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(thiserror::Error, Debug)]
pub enum Error {
	#[error("database error")]
	Db(#[from] crate::db::DbError),
}
impl Responder<'_> for Error {
	fn respond_to(self, request: &Request) -> response::Result<'static> {
		match self {
			// TODO: When in debug mode, print out database error inner details
			Error::Db(inner) => {
				let msg = if request.guard::<State<Environment>>().map(|f| f.is_dev()).succeeded().unwrap_or(false) {
					format!("There was a database error: {}", inner)
				} else {
					"There was a database error.".to_string()
				};
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
