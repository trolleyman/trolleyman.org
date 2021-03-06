use super::recaptcha::ReCaptchaGuard;
use crate::config::Config;
use rand::Rng;
use rocket::{http::Status, response::status, Route, State};
use rocket_contrib::templates::{self, Template};

pub fn routes() -> Vec<Route> { routes![heartbeat, index, robots_txt, error, contact_details, project] }

#[get("/heartbeat")]
fn heartbeat() -> String { "A-ok!".to_string() }

#[get("/")]
fn index(config: State<Config>) -> Template {
	let num_bg = 16;
	let i = rand::thread_rng().gen_range(0, num_bg) + 1;

	Template::render(
		"index",
		json!({
			"bg_url": format!("/static/img/bg/{:02}.jpg", i),
			"sitekey": config.recaptcha.public_key.clone(),
		}),
	)
}

#[get("/robots.txt")]
fn robots_txt() -> &'static [u8] {
	include_bytes!("../../assets/robots.txt")
}

#[get("/contact_details")]
fn contact_details(_recaptcha: ReCaptchaGuard) -> Template { Template::render("contact_details", json!({})) }

#[get("/projects/<project_name>")]
fn project(project_name: String, metadata: templates::Metadata) -> Option<Template> {
	let template_name = format!("projects/{}", project_name);
	if project_name.starts_with('_') || !metadata.contains_template(&template_name) {
		None
	} else {
		Some(Template::render(
			template_name,
			json!({
				"project_name": project_name,
			}),
		))
	}
}

#[get("/error?<code>")]
fn error(code: u16) -> Result<status::Custom<String>, String> {
	if let Some(status) = Status::from_code(code) {
		Ok(status::Custom(status, format!("{}: {}", code, status.reason)))
	} else {
		Err(format!("Unknown code: {}", code))
	}
}
