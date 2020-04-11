
from fbchat import Client
from fbchat.models import *

class LoveReactBot(Client):
    def onReactionAdded(self, mid, reaction, author_id, thread_id, thread_type, ts, msg, **kwargs):
        if reaction == MessageReaction.HEART and self.uid == author_id:
            self.reactToMessage(mid, MessageReaction.LOVE)

client = LoveReactBot("email", "password")
client.listen()
