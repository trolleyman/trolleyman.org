// This file is generated. Do not edit
// @generated

// https://github.com/Manishearth/rust-clippy/issues/702
#![allow(unknown_lints)]
#![allow(clippy::all)]

#![cfg_attr(rustfmt, rustfmt_skip)]

#![allow(box_pointers)]
#![allow(dead_code)]
#![allow(missing_docs)]
#![allow(non_camel_case_types)]
#![allow(non_snake_case)]
#![allow(non_upper_case_globals)]
#![allow(trivial_casts)]
#![allow(unsafe_code)]
#![allow(unused_imports)]
#![allow(unused_results)]


// interface

pub trait FacebookSrv {
    fn login(&self, o: ::grpc::RequestOptions, p: super::facebook::LoginDetails) -> ::grpc::SingleResponse<super::facebook::LoginToken>;
}

// client

pub struct FacebookSrvClient {
    grpc_client: ::std::sync::Arc<::grpc::Client>,
    method_login: ::std::sync::Arc<::grpc::rt::MethodDescriptor<super::facebook::LoginDetails, super::facebook::LoginToken>>,
}

impl ::grpc::ClientStub for FacebookSrvClient {
    fn with_client(grpc_client: ::std::sync::Arc<::grpc::Client>) -> Self {
        FacebookSrvClient {
            grpc_client: grpc_client,
            method_login: ::std::sync::Arc::new(::grpc::rt::MethodDescriptor {
                name: "/FacebookSrv/login".to_string(),
                streaming: ::grpc::rt::GrpcStreaming::Unary,
                req_marshaller: Box::new(::grpc::protobuf::MarshallerProtobuf),
                resp_marshaller: Box::new(::grpc::protobuf::MarshallerProtobuf),
            }),
        }
    }
}

impl FacebookSrv for FacebookSrvClient {
    fn login(&self, o: ::grpc::RequestOptions, p: super::facebook::LoginDetails) -> ::grpc::SingleResponse<super::facebook::LoginToken> {
        self.grpc_client.call_unary(o, p, self.method_login.clone())
    }
}

// server

pub struct FacebookSrvServer;


impl FacebookSrvServer {
    pub fn new_service_def<H : FacebookSrv + 'static + Sync + Send + 'static>(handler: H) -> ::grpc::rt::ServerServiceDefinition {
        let handler_arc = ::std::sync::Arc::new(handler);
        ::grpc::rt::ServerServiceDefinition::new("/FacebookSrv",
            vec![
                ::grpc::rt::ServerMethod::new(
                    ::std::sync::Arc::new(::grpc::rt::MethodDescriptor {
                        name: "/FacebookSrv/login".to_string(),
                        streaming: ::grpc::rt::GrpcStreaming::Unary,
                        req_marshaller: Box::new(::grpc::protobuf::MarshallerProtobuf),
                        resp_marshaller: Box::new(::grpc::protobuf::MarshallerProtobuf),
                    }),
                    {
                        let handler_copy = handler_arc.clone();
                        ::grpc::rt::MethodHandlerUnary::new(move |o, p| handler_copy.login(o, p))
                    },
                ),
            ],
        )
    }
}
