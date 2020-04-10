use rocket_contrib::templates::Template;

pub fn catchers() -> Vec<rocket::Catcher> { catchers![error_handler_400_bad_request, error_handler_404_not_found] }

#[catch(400)]
fn error_handler_400_bad_request(_req: &rocket::Request) -> Template {
	Template::render(
		"error",
		json!({
			"status": "400",
			"title": "Bad Request",
			"msg": "Client sent a bad request.",
		}),
	)
}

#[catch(404)]
fn error_handler_404_not_found(req: &rocket::Request) -> Template {
	Template::render(
		"error",
		json!({
			"status": "404",
			"title": "Not Found",
			"msg": format!("{} {} could not be found.", req.method(), req.uri().path()),
		}),
	)
}
