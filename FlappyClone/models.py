from django.db import models

import json

def toJSON(dict):
    return json.dumps(dict, ensure_ascii=False, separators=(',', ':'))

class LeaderboardEntry(models.Model):
    name = models.CharField(max_length=127)
    score = models.IntegerField()
    date = models.DateTimeField()
    
    def toJSON(self):
        return toJSON({
            'name' : self.name,
            'score': self.score,
            'date' : str(self.date),
        })
    
    def __str__(self):
        return '{}: {} - {}'.format(self.name, self.score, str(self.date))

# TODO: class User(models.Model):