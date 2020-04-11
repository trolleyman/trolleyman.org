
import grpc
import proto.facebook_pb2 as pb
import proto.facebook_pb2_grpc as pb_grpc

from concurrent import futures
import random
import time
import os
from datetime import datetime, timedelta


class RpcTokenState():
    def __init__(self, token, email, session):
        self.token = token
        self.email = email
        self.session = session


class FacebookService(pb_grpc.FacebookSrvServicer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.rpc_tokens_by_token = dict()
        self.rpc_tokens_by_email = dict()

    def _new_token(email, password):
        

    def _get_rpc_token(email, password):
        try:
            return self.rpc_tokens_by_email[email]
        except KeyError:
            pass
        token = [random.choice("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(128)]
        self.tokens[token] = TokenState(token, email)
        print("Logging in with email={}...".format(email))
        # TODO
        time.sleep(100)
        print("Logged in with email={}, token={}, expires={}".format(
            email, token, expires))
        return token

    def login(self, details, context):
        assert(details.email is not None)
        assert(details.password is not None)
        token = self._get_rpc_token(details.email, details.password)
        return pb.LoginToken(token=token)

    def serve(port):
        print("Initialising gRPC server...")
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        pb_grpc.add_FacebookSrvServicer_to_server(FacebookService(), server)
        server.add_insecure_port('[::]:{}'.format(port))
        server.start()
        print("gRPC server started on port {}".format(port))
        server.wait_for_termination()

if __name__ == "__main__":
    try:
        port = int(os.environ['FACEBOOK_GRPC_PORT'])
    except KeyError:
        port = 9001
    FacebookService.serve(port)
