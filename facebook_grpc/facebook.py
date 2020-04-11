
from concurrent import futures
import random
import time
import os
from datetime import datetime, timedelta
import multiprocessing
import queue

import grpc
import proto.facebook_pb2 as pb
import proto.facebook_pb2_grpc as pb_grpc

from fbchat import Client
from fbchat.models import *


def love_worker(q):
    bots = []
    while True:
        try:
            email, password, session = q.get(False)
            bot = LoveBot(email, password, session_cookies=session)
            bot.startListening()
            bot.setActiveStatus(False)
            bots.append(bot)
        except queue.Empty:
            pass

        for bot in bots:
            bot.doOneListen()
        time.sleep(1)


class LoveBot(Client):
    def onReactionAdded(self, mid, reaction, author_id, thread_id, thread_type, ts, msg, **kwargs):
        if reaction == MessageReaction.HEART and self.uid == author_id:
            self.reactToMessage(mid, MessageReaction.LOVE)
            print('Changed reaction of message ID {} to heart face'.format(mid))
        super().onReactionAdded(mid, reaction, author_id, thread_id, thread_type, ts, msg, **kwargs)


class RpcTokenState():
    def __init__(self, token, email, client):
        self.token = token
        self.email = email
        self.client = client


class SessionManager():
    def __init__():
        self.rpc_token_state_by_email = []
        self.rpc_token_state_by_token = []
        self.bot_queue = multiprocessing.Queue()
        p = multiprocessing.Process(target=love_worker, args=(self.bot_queue,))
        p.start()

    def generate_token(self, email, password):
        try:
            token_state = self.rpc_token_state_by_email[email]
        except KeyError:
            client = Client(email, password)
            token = [random.choice("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(25)]
            token_state = TokenState(token, email, client)
            self.rpc_token_state_by_email[email] = token_state
            self.rpc_token_state_by_token[token] = token_state

            # Spawn new love bot
            self.bot_queue.put((email, password, client.getSession()))

        return token_state

    def get_session_from_rpc_token(self, rpc_token):
        return self.rpc_token_state_by_token[rpc_token]


class FacebookService(pb_grpc.FacebookServicer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.session_manager = SessionManager()

    def echo(self, echo, context):
        assert(echo.payload is not None)
        return echo

    def login(self, details, context):
        assert(details.email is not None)
        assert(details.password is not None)
        token = self.session_manager.generate_token(details.email, details.password)
        return pb.LoginToken(token=token)

    def serve(self, port):
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
