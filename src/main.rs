#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;

#[macro_use] extern crate diesel;

#[macro_use] extern crate serde_json;
#[macro_use] extern crate maplit;


use rocket::config::Environment;
use rocket::State;
use rocket_contrib::serve::StaticFiles;
use rocket_contrib::templates::{self, Template};

use rand::Rng;

pub mod schema;

mod config;
mod recaptcha;
mod flappy;

use config::AppConfig;
use recaptcha::ReCaptchaGuard;


#[database("db")]
pub struct DbConn(diesel::SqliteConnection);

pub struct ErrorMessage(Option<String>);


#[get("/")]
fn index(config: State<AppConfig>) -> Template {
	let num_bg = 16;
	let i = rand::thread_rng().gen_range(0, num_bg) + 1;

	Template::render("index", json!({
		"bg_url": format!("/static/img/bg/{:02}.jpg", i),
		"sitekey": config.recaptcha_public_key.clone(),
	}))
}

#[get("/contact_details")]
fn contact_details(_recaptcha: ReCaptchaGuard) -> Template {
	Template::render("contact_details", json!({}))
}

#[get("/projects/<project_name>")]
fn project(project_name: String, metadata: templates::Metadata) -> Option<Template> {
	let template_name = format!("projects/{}", project_name);
	if !metadata.contains_template(&template_name) {
		None
	} else {
		Some(Template::render(template_name, json!({
			"project_name": project_name,
		})))
	}
}


#[catch(400)]
fn error_400_bad_request(req: &rocket::Request) -> Template {
	let msg = if let Some(msg) = &req.local_cache(|| ErrorMessage(None)).0 { format!(": {}", msg) } else { String::new() };
	Template::render("error", json!({
		"status": "400".to_string(),
		"title": "Bad Request".to_string(),
		"msg": format!("Client sent a bad request{}.", msg),
	}))
}

#[catch(404)]
fn error_404_not_found(req: &rocket::Request) -> Template {
	Template::render("error", hashmap!{
		"status" => "404".to_string(),
		"title" => "Not Found".to_string(),
		"msg" => format!("'{}' could not be found.", req.uri().path()),
	})
}


fn main() {
	let active_env = Environment::active().expect("Invalid environment");
	let configs = rocket::config::RocketConfig::read().unwrap();
	rocket::custom(configs.get(active_env).clone())
		.attach(Template::fairing())
		.attach(DbConn::fairing())
		.manage(AppConfig::load(active_env))
		.register(catchers![error_400_bad_request, error_404_not_found])
		.mount("/", routes![index, contact_details, project])
		.mount("/static", StaticFiles::from("./static"))
		.mount("/flappy", flappy::routes())
		.launch();
}
