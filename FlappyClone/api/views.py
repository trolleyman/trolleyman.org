from django.shortcuts import render
from django.http import HttpResponse

from .. import models

def leaderboard(request):
    json = '[' + ','.join(x.toJSON() for x in models.LeaderboardEntry.objects.order_by('-score')[:10]) + ']'
    return HttpResponse(json, content_type='application/json')
