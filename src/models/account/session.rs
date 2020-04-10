use chrono::prelude::*;

use crate::{
	db::{DbConn, DbResult},
	models::schema::session_token,
};
use diesel::prelude::*;

pub const SESSION_TOKEN_COOKIE_NAME: &'static str = "session_token";

#[derive(Clone, Queryable, Identifiable)]
#[table_name = "session_token"]
#[primary_key(token)]
pub struct SessionToken {
	pub token:   String,
	pub user:    i32,
	pub expires: NaiveDateTime,
}
impl SessionToken {
	pub fn get_unexpired(conn: &DbConn, token: &str) -> DbResult<Option<SessionToken>> {
		session_token::table
			.filter(session_token::expires.gt(Utc::now().naive_utc()))
			.filter(session_token::token.eq(token))
			.get_result(conn)
			.optional()
	}
}
