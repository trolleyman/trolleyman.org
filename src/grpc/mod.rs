use crate::{config::Config, error::Result, util};
use std::time::Duration;

use anyhow::Context;

mod gen;

pub use gen::{Echo, LoginDetails, LoginToken};

pub fn setup(config: &Config) -> Result<FacebookClient> {
	util::retry::until_timeout(
		Duration::from_secs(60),
		&format!("Failed to connect to gRPC host {}", config.facebook_grpc.host),
		|| {
			let mut rt = tokio::runtime::Builder::new()
				.basic_scheduler()
				.enable_all()
				.build()
				.context("Tokio's runtime could not start")?;
			let client = rt.block_on(setup_async(config))?;
			Ok(FacebookClient { client, rt })
		},
	)
}

async fn setup_async(config: &Config) -> Result<gen::FacebookClient<tonic::transport::Channel>> {
	let endpoint =
		tonic::transport::Endpoint::from_shared(format!("grpc://{}", config.facebook_grpc.host)).context("Invalid endpoint")?;
	let mut client = gen::FacebookClient::connect(endpoint).await?;
	let req = Echo { payload: util::random_token() };
	let res = client.echo(tonic::Request::new(req.clone())).await?.into_inner();
	if res.payload != req.payload {
		return Err(anyhow!("Sent echo payload != recv echo payload").into());
	}
	Ok(client)
}

// The order of the fields in this struct is important. They must be ordered
// such that when `BlockingClient` is dropped the client is dropped
// before the runtime. Not doing this will result in a deadlock when dropped.
// Rust drops struct fields in declaration order.
pub struct FacebookClient {
	client: gen::FacebookClient<tonic::transport::Channel>,
	rt:     tokio::runtime::Runtime,
}
impl FacebookClient {}
