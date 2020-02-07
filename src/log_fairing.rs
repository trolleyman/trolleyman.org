
use rocket::{Rocket, Request, Response, Data};
use rocket::fairing::{Fairing, Info, Kind};

pub struct LogFairing {
	
}
impl LogFairing {
	pub fn fairing() -> LogFairing {
		LogFairing {
			
		}
	}
}
impl Fairing for LogFairing {
	fn info(&self) -> Info {
		Info {
			name: "Log Fairing",
			kind: Kind::Attach | Kind::Launch | Kind::Request | Kind::Response
		}
	}

	fn on_attach(&self, rocket: Rocket) -> Result<Rocket, Rocket> {
		Ok(rocket)
	}
	fn on_launch(&self, rocket: &Rocket) {
		
	}
	fn on_request(&self, request: &mut Request, data: &Data) {
		
	}
	fn on_response(&self, request: &Request, response: &mut Response) {
		
	}
}
