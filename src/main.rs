#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
extern crate rocket_contrib;

#[macro_use] extern crate serde_json;
#[macro_use] extern crate maplit;


use std::collections::HashMap;

use rocket::config::Environment;
use rocket::State;

use rocket_contrib::serve::StaticFiles;
use rocket_contrib::templates::Template;

use rand::Rng;


mod config;
mod recaptcha;

use config::AppConfig;
use recaptcha::ReCaptchaGuard;


pub struct ErrorMessage(Option<String>);


#[get("/")]
fn index(config: State<AppConfig>) -> Template {
	let num_bg = 16;
	let i = rand::thread_rng().gen_range(0, num_bg) + 1;

	Template::render("index", hashmap!{
		"bg_url" => format!("homepage/images/bg/{:02}.jpg", i),
		"sitekey" => config.recaptcha_public_key.clone(),
	})
}

#[get("/contact_details")]
fn contact_details(_recaptcha: ReCaptchaGuard) -> Template {
	Template::render("contact_details", HashMap::<String, String>::new())
}


#[catch(400)]
fn error_400_bad_request(req: &rocket::Request) -> Template {
	let msg = if let Some(msg) = &req.local_cache(|| ErrorMessage(None)).0 { format!(": {}", msg) } else { String::new() };
	Template::render("error", hashmap!{
		"status" => "400".to_string(),
		"title" => "Bad Request".to_string(),
		"msg" => format!("Client sent a bad request{}.", msg),
	})
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
	let env = Environment::active().expect("Invalid environment");
	rocket::custom(rocket::config::ConfigBuilder::new(env).expect("Invalid config"))
		.attach(Template::custom(|_engines| {
			//engines.tera.new();
		}))
		.manage(AppConfig::load(env))
		.register(catchers![error_400_bad_request, error_404_not_found])
		.mount("/", routes![index, contact_details])
		.mount("/static", StaticFiles::from("./static"))
		.launch();
}
