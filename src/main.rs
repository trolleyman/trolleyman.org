#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
extern crate rocket_contrib;

#[macro_use] extern crate maplit;


use rocket::Request;
use rocket::config::Environment;
use rocket::State;

use rocket_contrib::serve::StaticFiles;
use rocket_contrib::templates::Template;

use rand::Rng;


struct Config {
	recaptcha_public_key: String,
	recaptcha_private_key: String,
}
impl Config {
	pub fn load(env: Environment) -> Config {
		if env.is_dev() {
			Config {
				recaptcha_public_key: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI".to_string(),
				recaptcha_private_key: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe".to_string(),
			}
		} else {
			todo!("Implement config loading (maybe from .env files)")
		}
	}
}

struct RequestMessage(Option<String>);


#[get("/")]
fn index(config: State<Config>) -> Template {
	let num_bg = 16;
	let i = rand::thread_rng().gen_range(0, num_bg) + 1;

	Template::render("index", hashmap!{
		"bg_url" => format!("homepage/images/bg/{:02}.jpg", i),
		"sitekey" => config.recaptcha_public_key.clone(),
	})
}

#[get("/contact_details")]
fn contact_details(config: State<Config>) -> Template {
	// Check if g-recaptcha-response is valid.
	//req.; TODO
    // try:
    //     token = request.META['HTTP_G_RECAPTCHA_RESPONSE']
    // except KeyError:
    //     return error400_bad_request(request, "Couldn't find key 'g-recaptcha-response'")

    // url = 'https://www.google.com/recaptcha/api/siteverify'

    // data = {
    //     'secret': settings.RECAPTCHA_PRIVATE_KEY,
    //     'response': token,
    // }
    // try:
    //     data['remoteip'] = request.META['HTTP_REMOTE_ADDR']
    // except KeyError:
    //     pass  # Ignore

    // r = requests.post(url, data=data)
	// if r.status_code >= 200 and r.status_code < 300:
    //     return render(request, 'homepage/contact_details.html', {
    //         'sitekey': settings.RECAPTCHA_PUBLIC_KEY
    //     })

    // else:
	// 	return error400_bad_request(request, 'RECAPTCHA error: ' + r.text)
	
	if false {
		Template::render("contact_details", ())
	} else {
		panic!("error");
	}
}


#[catch(400)]
fn error_400_bad_request(req: &rocket::Request) -> Template {
	let msg = if let Some(msg) = &req.local_cache(|| RequestMessage(None)).0 { format!(": {}", msg) } else { String::new() };
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
		.manage(Config::load(env))
		.register(catchers![error_400_bad_request, error_404_not_found])
		.mount("/", routes![index])
		.mount("/static", StaticFiles::from("./static"))
		.launch();
}
