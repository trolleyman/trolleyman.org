
import grpc
import proto.facebook_grpc_pb2 as pb
import proto.facebook_grpc_pb2_grpc as pb_grpc

from concurrent import futures
import random
import time
import os
from datetime import datetime, timedelta


class TokenState():
    def __init__(self, token, username, expires):
        self.token = token
        self.username = username
        self.expires = expires


class FacebookService(pb_grpc.FacebookSrvServicer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tokens = dict()

    def _generate_token(username, password):
        token = [random.choice(
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(128)]
        expires = datetime.now(timezone.utc) + timedelta(hours=1)
        self.tokens[token] = TokenState(token, username, expires)
        print("Logging in with username={}...".format(username))
        # TODO
        time.sleep(100)
        print("Logged in with username={}, token={}, expires={}".format(
            username, token, expires))
        return token

    def Login(self, details, context):
        assert(details.username is not None)
        assert(details.password is not None)
        token = self._generate_token(details.username, details.password)
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
