#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;

#[get("/tanks")]
fn tanks() -> &'static str {
	""
}

fn main() {
	rocket::ignite().mount("/", routes![tanks]).launch();
}
