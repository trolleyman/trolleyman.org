use rocket::{
	response::{self, Redirect, Responder},
	Request,
};
use rocket_contrib::templates::Template;

#[derive(FromForm)]
pub struct RegisterForm {
	pub username: String,
	pub email:    String,
	pub email2:   String,
	pub password: String,
}

#[derive(FromForm)]
pub struct LoginForm {
	pub username: String,
	pub password: String,
	pub remember: bool,
}

#[derive(derive_more::From)]
pub enum TemplateRedirect {
	Template(Template),
	Redirect(Redirect),
}
impl<'r> Responder<'r> for TemplateRedirect {
	fn respond_to(self, request: &Request<'_>) -> response::Result<'r> {
		match self {
			TemplateRedirect::Template(template) => template.respond_to(request),
			TemplateRedirect::Redirect(redirect) => redirect.respond_to(request),
		}
	}
}
