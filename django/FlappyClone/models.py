from django.db import models
from django.forms import ModelForm
from django.db.models.signals import post_save
from django.contrib.auth.models import User

import json as js

def dumps(o):
    return js.dumps(o, separators=(',',':'))

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    date = models.DateTimeField(default=None, null=True)
    
    def toLeaderboardEntryJSON(self):
        return dumps({
            'username': self.user.get_username(),
            'score': self.score,
        })
    
    def toJSON(self):
        return dumps({
            'username': self.user.get_username(),
            'score': self.score,
            'date': str(self.date),
            'medal': self.medal,
        })
    
    @property
    def medal(self):
        if self.score <= 4:
            return 0 # None
        elif self.score <= 15:
            return 1 # Bronze
        elif self.score <= 30:
            return 2 # Silver
        else:
            return 3 # Gold

'''
Register UserProfile every time a new user is saved
'''
def create_profile(sender, **kwargs):
    user = kwargs["instance"]
    if kwargs["created"]:
        up = UserProfile(user=user)
        up.save()
post_save.connect(create_profile, sender=User)
