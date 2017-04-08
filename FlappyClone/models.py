from django.db import models

import json

class LeaderboardEntry(models.Model):
    name = models.CharField(max_length=127)
    score = models.IntegerField()
    date = models.DateTimeField()
    
    def toJSON(self):
        return json.dumps({
            'name' : self.name,
            'score': self.score,
            'date' : str(self.date),
        }, ensure_ascii=False, separators=(',', ':'))
    
    def __str__(self):
        return '{}: {} - {}'.format(self.name, self.score, str(self.date))

# TODO: class User(models.Model):