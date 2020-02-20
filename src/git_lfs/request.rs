use std::{io::Read, path::Path};

use rocket::{
	data::{self, FromDataSimple},
	http::Status,
	outcome::IntoOutcome,
	Data, Outcome, Request, State,
};

#[derive(Debug)]
pub enum BatchRequestError {
	AcceptHeader,
}

pub struct BatchRequest {
	// TODO
}
impl FromDataSimple for BatchRequest {
	type Error = BatchRequestError;

	fn from_data(req: &Request, data: Data) -> data::Outcome<Self, Self::Error> {
		if req.accept() != Some("application/vnd.git-lfs+json") {
			return Outcome::Failure(BatchRequestError::AcceptHeader);
		}
		todo!()
	}
}
