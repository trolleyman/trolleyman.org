#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LoginDetails {
	#[prost(string, tag = "1")]
	pub email:    std::string::String,
	#[prost(string, tag = "2")]
	pub password: std::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LoginToken {
	#[prost(string, tag = "1")]
	pub token: std::string::String,
	#[prost(string, tag = "2")]
	pub email: std::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LoginError {
	#[prost(enumeration = "LoginErrorKind", tag = "1")]
	pub kind:    i32,
	#[prost(string, tag = "2")]
	pub message: std::string::String,
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct LoginResult {
	#[prost(oneof = "login_result::Result", tags = "1, 2")]
	pub result: ::std::option::Option<login_result::Result>,
}
pub mod login_result {
	#[derive(Clone, PartialEq, ::prost::Oneof)]
	pub enum Result {
		#[prost(message, tag = "1")]
		Token(super::LoginToken),
		#[prost(message, tag = "2")]
		Error(super::LoginError),
	}
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Echo {
	#[prost(string, tag = "1")]
	pub payload: std::string::String,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
#[repr(i32)]
pub enum LoginErrorKind {
	LoginErrorUnknown = 0,
	LoginErrorFbChat = 1,
}
#[doc = r" Generated client implementations."]
pub mod facebook_client {
	#![allow(unused_variables, dead_code, missing_docs)]
	use tonic::codegen::*;
	pub struct FacebookClient<T> {
		inner: tonic::client::Grpc<T>,
	}
	impl FacebookClient<tonic::transport::Channel> {
		#[doc = r" Attempt to create a new client by connecting to a given endpoint."]
		pub async fn connect<D>(dst: D) -> Result<Self, tonic::transport::Error>
		where
			D: std::convert::TryInto<tonic::transport::Endpoint>,
			D::Error: Into<StdError>,
		{
			let conn = tonic::transport::Endpoint::new(dst)?.connect().await?;
			Ok(Self::new(conn))
		}
	}
	impl<T> FacebookClient<T>
	where
		T: tonic::client::GrpcService<tonic::body::BoxBody>,
		T::ResponseBody: Body + HttpBody + Send + 'static,
		T::Error: Into<StdError>,
		<T::ResponseBody as HttpBody>::Error: Into<StdError> + Send,
	{
		pub fn new(inner: T) -> Self {
			let inner = tonic::client::Grpc::new(inner);
			Self { inner }
		}

		pub fn with_interceptor(inner: T, interceptor: impl Into<tonic::Interceptor>) -> Self {
			let inner = tonic::client::Grpc::with_interceptor(inner, interceptor);
			Self { inner }
		}

		pub async fn echo(
			&mut self,
			request: impl tonic::IntoRequest<super::Echo>,
		) -> Result<tonic::Response<super::Echo>, tonic::Status> {
			self.inner.ready().await.map_err(|e| {
				tonic::Status::new(tonic::Code::Unknown, format!("Service was not ready: {}", e.into()))
			})?;
			let codec = tonic::codec::ProstCodec::default();
			let path = http::uri::PathAndQuery::from_static("/facebook.Facebook/echo");
			self.inner.unary(request.into_request(), path, codec).await
		}

		pub async fn login(
			&mut self,
			request: impl tonic::IntoRequest<super::LoginDetails>,
		) -> Result<tonic::Response<super::LoginResult>, tonic::Status> {
			self.inner.ready().await.map_err(|e| {
				tonic::Status::new(tonic::Code::Unknown, format!("Service was not ready: {}", e.into()))
			})?;
			let codec = tonic::codec::ProstCodec::default();
			let path = http::uri::PathAndQuery::from_static("/facebook.Facebook/login");
			self.inner.unary(request.into_request(), path, codec).await
		}

		pub async fn login_all(
			&mut self,
			request: impl tonic::IntoStreamingRequest<Message = super::LoginDetails>,
		) -> Result<tonic::Response<tonic::codec::Streaming<super::LoginResult>>, tonic::Status> {
			self.inner.ready().await.map_err(|e| {
				tonic::Status::new(tonic::Code::Unknown, format!("Service was not ready: {}", e.into()))
			})?;
			let codec = tonic::codec::ProstCodec::default();
			let path = http::uri::PathAndQuery::from_static("/facebook.Facebook/login_all");
			self.inner.streaming(request.into_streaming_request(), path, codec).await
		}
	}
	impl<T: Clone> Clone for FacebookClient<T> {
		fn clone(&self) -> Self { Self { inner: self.inner.clone() } }
	}
	impl<T> std::fmt::Debug for FacebookClient<T> {
		fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { write!(f, "FacebookClient {{ ... }}") }
	}
}
