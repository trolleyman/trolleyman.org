use rand::Rng;

pub mod read;
pub mod retry;
pub mod serde;

pub fn random_token() -> String {
	// 22 characters of an alphanumeric distribution gives about the same possibilities as a UUID, so basically no chance of a collision
	rand::thread_rng().sample_iter(&rand::distributions::Alphanumeric).take(22).collect()
}
