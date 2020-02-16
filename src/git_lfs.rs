use std::{io::Read, path::Path};

use rocket::{
	data::{self, FromDataSimple},
	http::Status,
	outcome::IntoOutcome,
	Data, Outcome, Request, State,
};


pub fn routes() -> Vec<rocket::Route> { routes![] }
