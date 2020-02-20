
use rocket::{
	http::Status, Json
};

pub fn routes() -> Vec<rocket::Route> { routes![batch] }

#[derive(serde::Serialize)]
pub struct BatchResponse {
	transfer: String,
	
}

#[get("/<owner>/<repository_git>/info/lfs/objects/batch")]
fn batch(owner: String, repository_git: String) -> Result<Json<BatchResponse>, (Status, String)> {
	if !repository_git.ends_with(".git") {
		return Err((Status::NotFound, "".into()));
	}
	todo!()
}
