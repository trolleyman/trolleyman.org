use chrono::prelude::*;

use crate::{
	models::schema::session_token,
};

pub const SESSION_TOKEN_COOKIE_NAME: &'static str = "session_token";

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "session_token"]
#[primary_key(token)]
pub struct SessionToken {
	pub token: String,
	pub user: i32,
	pub expires: NaiveDateTime,
}
