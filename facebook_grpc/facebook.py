
from concurrent import futures
import random
import time
import os
from datetime import datetime, timedelta
import multiprocessing
import queue
import concurrent.futures
import json
import threading

import grpc
import proto.facebook_pb2 as pb
import proto.facebook_pb2_grpc as pb_grpc

from fbchat import Client, FBchatException
from fbchat.models import *


DIR = os.path.dirname(os.path.abspath(__file__))
TOKENS_PATH = os.path.join(DIR, 'data', 'facebook_grpc_tokens.json')


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
            print('info: Changed reaction of message ID {} to heart face'.format(mid))
        super().onReactionAdded(mid, reaction, author_id, thread_id, thread_type, ts, msg, **kwargs)


class RpcTokenState():
    def __init__(self, token, email, client):
        self.token = token
        self.email = email
        self.client = client


class SessionManager():
    def __init__(self):
        self.save_lock = threading.Lock()
        self.rpc_token_state_by_email = dict()
        self.rpc_token_state_by_token = dict()
        self.bot_queue = multiprocessing.Queue()
        p = multiprocessing.Process(target=love_worker, args=(self.bot_queue,))

        self._load()

        p.start()

    def _load(self):
        print('Loading database...')
        if not os.path.exists(TOKENS_PATH):
            print('Database does not exist, loading empty database')
            return
        with open(TOKENS_PATH, 'r') as f:
            data = json.load(f)
            for obj in data:
                email = obj['email']
                token = obj['token']
                session_cookies = obj['session_cookies']
                try:
                    client = Client(email, 'invalidpass', session_cookies=session_cookies, max_tries=2)
                    token_state = RpcTokenState(token, email, client)
                    self.rpc_token_state_by_email[email] = token_state
                    self.rpc_token_state_by_token[token] = token_state
                except Exception as e:
                    print('Warning: Failed to load user {}: {}'.format(email, e))
        print('Loaded {} user(s)'.format(len(self.rpc_token_state_by_email)))

    def _save(self):
        with self.save_lock:
            print('Saving database...')
            if not os.path.isdir(os.path.dirname(TOKENS_PATH)):
                os.makedirs(os.path.dirname(TOKENS_PATH))
            start_time = time.time()
            with open(TOKENS_PATH, 'w') as f:
                data = [{'email': email, 'token': token_state.token, 'session_cookies': token_state.client.getSession()} for (email, token_state) in self.rpc_token_state_by_email.items()]
                json.dump(data, f)
            print('Saved database ({:.3}s)'.format(time.time() - start_time))

    def generate_token(self, email, password):
        try:
            token_state = self.rpc_token_state_by_email[email]
        except KeyError:
            client = Client(email, password)
            token = ''.join(random.choice("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") for _ in range(25))
            token_state = RpcTokenState(token, email, client)
            self.rpc_token_state_by_email[email] = token_state
            self.rpc_token_state_by_token[token] = token_state
            print('New token generated for {}: {}'.format(email, token))
            self._save()

            # Spawn new love bot
            self.bot_queue.put((email, password, client.getSession()))

        return token_state.token

    def get_session_from_rpc_token(self, rpc_token):
        return self.rpc_token_state_by_token[rpc_token]


def exception_to_login_result(exc):
    message = str(exc)
    if isinstance(exc, FBchatException):
        kind = pb.LOGIN_ERROR_FB_CHAT
    else:
        kind = pb.LOGIN_ERROR_UNKNOWN
    return pb.LoginResult(error=pb.LoginError(kind=kind, message=message))


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
        try:
            token = self.session_manager.generate_token(details.email, details.password)
            return pb.LoginResult(token=pb.LoginToken(token=token, email=details.email))
        except Exception as exc:
            return exception_to_login_result(exc)

    def login_all(self, details_iter, context):
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_details = {executor.submit(self.login, details, context): details for details in details_iter}
            for future in concurrent.futures.as_completed(future_to_details):
                details = future_to_details[future]
                try:
                    yield future.result()
                except Exception as exc:
                    yield exception_to_login_result(exc)

    @classmethod
    def serve(cls, port):
        print("Initialising gRPC server...")
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        pb_grpc.add_FacebookServicer_to_server(FacebookService(), server)
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
