
use rocket::Rocket;
use rocket::fairing::{Fairing, Info, Kind};

pub struct LogFairing {
	
}
impl Fairing for LogFairing {
	fn info() -> Info {
		Info {
			name: "Log Fairing",
			kind: Kind::Attach | Kind::Launch | Kind::Request | Kind::Response
		}
	}

	fn on_attach(&self, rocket: Rocket) -> Result<Rocket, Rocket> {
		
	}
	fn on_launch(&self, rocket: &Rocket) {
		
	}
	fn on_request(&self, request: &mut Request, data: &Data) {
		
	}
	fn on_response(&self, request: &Request, response: &mut Response) {
		
	}
}
