use diesel::prelude::*;

use crate::{
	db::{DbConn, DbResult},
	models::schema::facebook_account,
};

#[derive(Insertable)]
#[table_name = "facebook_account"]
struct NewFacebookAccount<'a> {
	pub user_id:  i32,
	pub email:    &'a str,
	pub password: &'a str,
}

#[derive(Clone, Queryable, Identifiable, Debug)]
#[table_name = "facebook_account"]
pub struct FacebookAccount {
	id: i32,
	pub user_id: i32,
	pub email: String,
	pub password: String,
}
impl FacebookAccount {
	pub fn create(conn: &DbConn, user_id: i32, email: &str, password: &str) -> DbResult<FacebookAccount> {
		let new_facebook_account = NewFacebookAccount { user_id, email, password };
		new_facebook_account.insert_into(facebook_account::table).execute(conn)?;
		facebook_account::table.filter(facebook_account::user_id.eq(user_id)).first(conn)
	}

	pub fn try_get_from_user_id(conn: &DbConn, user_id: i32) -> DbResult<Option<FacebookAccount>> {
		facebook_account::table.filter(facebook_account::user_id.eq(user_id)).first(conn).optional()
	}

	pub fn id(&self) -> i32 { self.id }

	pub fn delete(&self, conn: &DbConn) -> DbResult<()> {
		diesel::delete(facebook_account::table.filter(facebook_account::id.eq(self.id))).execute(conn).map(|_| ())
	}
}
