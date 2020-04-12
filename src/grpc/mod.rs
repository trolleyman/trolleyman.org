use crate::{config::Config, db::DbConn, error::Result, models::facebook::FacebookAccount, util};
use std::{collections::HashMap, time::Duration};

use anyhow::Context;
use gen::{Echo, LoginDetails};

mod gen;

pub fn setup(config: &Config, conn: &DbConn) -> Result<FacebookClient> {
	info!("Connecting to gRPC server at {}...", config.facebook_grpc.host);
	let mut client = util::retry::until_timeout(
		Duration::from_secs(60),
		&format!("Failed to connect to gRPC host {}", config.facebook_grpc.host),
		|| {
			let mut rt = tokio::runtime::Builder::new()
				.basic_scheduler()
				.enable_all()
				.build()
				.context("Tokio's runtime could not start")?;
			let client = rt.block_on(setup_async(config))?;
			Ok(FacebookClient::new(client, rt))
		},
	)?;
	info!("Connected to gRPC server at {}", config.facebook_grpc.host);
	let facebook_accounts = FacebookAccount::all(conn)?;
	info!("Getting tokens for {} Facebook login credentials...", facebook_accounts.len());
	client.cache_all_facebook_account_tokens(facebook_accounts);
	info!("Completed gRPC setup");
	Ok(client)
}

async fn setup_async(config: &Config) -> Result<gen::FacebookClient<tonic::transport::Channel>> {
	let endpoint = tonic::transport::Endpoint::from_shared(format!("grpc://{}", config.facebook_grpc.host))
		.context("Invalid endpoint")?;
	let mut client = gen::FacebookClient::connect(endpoint).await?;
	let req = Echo { payload: util::random_token() };
	let res = client.echo(req.clone()).await?.into_inner();
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
	rt: tokio::runtime::Runtime,
	email_token_cache: HashMap<String, String>,
}
impl FacebookClient {
	fn new(client: gen::FacebookClient<tonic::transport::Channel>, rt: tokio::runtime::Runtime) -> FacebookClient {
		FacebookClient { client, rt, email_token_cache: HashMap::new() }
	}

	fn cache_all_facebook_account_tokens(&mut self, accounts: impl IntoIterator<Item = FacebookAccount>) {
		for account in accounts {
			// TODO: Do in parallel
			match self.login(account.email.clone(), account.password) {
				Err(e) => warn!("Error encountered while caching facebook account {}: {}", account.email, e),
				_ => {}
			}
		}
	}

	pub fn login(&mut self, email: String, password: String) -> Result<String> {
		if self.email_token_cache.contains_key(&email) {
			Ok(self.email_token_cache[&email].clone())
		} else {
			let token = self.rt.block_on(self.client.login(LoginDetails { email: email.clone(), password }))?.into_inner().token;
			self.email_token_cache.insert(email, token.clone());
			Ok(token)
		}
	}
}
