use std::{
	thread::sleep,
	time::{Duration, Instant},
};

use crate::error::Result;

pub fn until_timeout<T, F>(timeout: Duration, error_msg: &str, mut f: F) -> Result<T>
where
	F: FnMut() -> Result<T>,
{
	let start_time = Instant::now();
	loop {
		match f() {
			Ok(t) => return Ok(t),
			Err(e) => {
				warn!("{}: {}", error_msg, e);
				let now = Instant::now();
				if now - start_time > timeout {
					warn!("Timeout ({:.2}s) expired, exiting", timeout.as_secs_f64());
					return Err(e);
				}

				sleep(Duration::from_secs(1));
			}
		}
	}
}
