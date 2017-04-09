from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.utils import timezone

from .. import models

from .lib import *

def leaderboard(request):
    json = '[' + ','.join(x.toJSON() for x in models.LeaderboardEntry.objects.order_by('-score')[:10]) + ']'
    return HttpResponse(json, content_type='application/json')

def submit(request):
    if request.method != 'POST':
        return HttpResponseNotAllowed('{"error":"Only POST allowed."}', content_type='application/json')
    
    # Get POST parameters
    try:
        name = request['name']
        score = request['score']
        
        # Validate name
        if (not isValidName(name)):
            raise ValueError()
        
        # Validate score
        if (int(score) <= 0):
            raise ValueError()
        score = int(score)
        
    except (KeyError, ValueError):
        return HttpResponseBadRequest('{"error":"Bad request."}', content_type='application/json');
    
    # Submit to database
    models.LeaderboardEntry(name=name, score=score, date=timezone.now()).save()
    
    json = '{"success":""}'
    return HttpResponse(json, content_type='application/json')