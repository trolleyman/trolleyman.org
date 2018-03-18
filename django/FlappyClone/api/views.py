from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, HttpResponseBadRequest, HttpResponseNotAllowed
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User

import datetime
import json as js

from .. import models

def leaderboard(request):
    """Gets the current top 10 players"""
    json = '[' + ','.join(x.toLeaderboardEntryJSON() for x in models.UserProfile.objects.filter(~Q(score=0)).order_by('-score')[:10]) + ']'
    return HttpResponse(json, content_type='application/json')

def profile(request):
    """Get information about a specific user"""
    try:
        username = request.GET['username']
    except KeyError:
        return HttpResponseBadRequest('{"error":"Username not specified."}', content_type='application/json')
    
    try:
        user = User.objects.get(username=username)
    except ObjectDoesNotExist:
        return HttpResponseNotFound('{"error":"User not found."}', content_type='application/json')
    
    return HttpResponse(user.userprofile.toJSON(), content_type='application/json')

def submit(request):
    """Submits a score to the database for the currently logged in user"""
    if request.method != 'POST':
        return HttpResponseNotAllowed('{"error":"Only POST allowed."}', content_type='application/json')
    
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden('{"error":"User not authenticated."}', content_type='application/json')
    
    # Parse score
    try:
        score = request.POST.get('score')
        score = int(score)
        if score <= 0:
            raise ValueError()
    except KeyError:
        return HttpResponseBadRequest('{"error":"score field not found."}', content_type='application/json')
    except ValueError:
        return HttpResponseBadRequest('{"error":"score field not valid."}', content_type='application/json')
    
    # Send score to database
    user.userprofile.score = score
    user.userprofile.date = datetime.datetime.now()
    user.userprofile.save()
    return HttpResponse('{}', content_type='application/json')
