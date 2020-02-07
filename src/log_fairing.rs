
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

	
}
