use chrono::prelude::*;
use diesel::prelude::*;
use serde::Serialize;

use crate::{
	db::{DbConn, DbResult},
	models::schema::{linc_interest as interest, linc_lastedited as lastedited, linc_person as person},
};

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "interest"]
pub struct Interest {
	pub id:   i32,
	pub name: String,
	pub desc: String,
}
impl Interest {
	pub fn load_all(conn: &DbConn) -> DbResult<Vec<Interest>> { interest::table.load::<Interest>(&**conn) }
}

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "person"]
pub struct Person {
	pub id: i32,
	pub name: String,
	pub interest1_id: Option<i32>,
	pub interest2_id: Option<i32>,
	pub interest3_id: Option<i32>,
	pub twitter_pic_url: Option<String>,
	pub twitter: Option<String>,
}
impl Person {
	pub fn load_all(conn: &DbConn) -> DbResult<Vec<Person>> { person::table.load::<Person>(&**conn) }
}

#[derive(Queryable, Identifiable, Serialize)]
#[table_name = "lastedited"]
pub struct LastEdited {
	pub id:        i32,
	#[serde(with = "crate::util::serde_naive_datetime")]
	pub timestamp: NaiveDateTime,
}
impl LastEdited {
	pub fn get(conn: &DbConn) -> DbResult<DateTime<Utc>> {
		Ok(DateTime::<Utc>::from_utc(
			match lastedited::table.first::<LastEdited>(&**conn).optional()? {
				Some(e) => e.timestamp,
				None => {
					let timestamp = Utc::now().naive_utc();
					NewLastEdited { timestamp }.save_new(&conn)?;
					timestamp
				}
			},
			Utc,
		))
	}
}

#[derive(Insertable)]
#[table_name = "lastedited"]
pub struct NewLastEdited {
	pub timestamp: NaiveDateTime,
}
impl NewLastEdited {
	pub fn save_new(&self, conn: &DbConn) -> DbResult<()> {
		self.insert_into(lastedited::table).execute(&**conn).map(|_| ())
	}
}
