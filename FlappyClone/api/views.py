from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.utils import timezone

from .. import models

# NB: If these constants are updated, remember to update the JavaScript versions (in js/score.js)!!
NUM_LEADERBOARD_ENTRIES = 10
MAX_NAME_LENGTH = 16
LEGAL_SYMBOLS = '-_'

# NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/score.js)!
def isValidNameChar(c):
    if (c >= 'a' and c <= 'z'):
        return True
    elif (c >= 'A' and c <= 'Z'):
        return True
    elif (c >= '1' and c <= '9'):
        return True
    elif (LEGAL_SYMBOLS.find(c) != -1):
        return True
    else:
        return False

# NB: If updating these functions, ensure that the JavaScript functions are also updated (in js/score.js)!
def isValidName(name):
    reason = ''
    if (len(name) == 0):
        return (False, 'name is an empty string')
    elif (len(name) > MAX_NAME_LENGTH):
        return (False, 'name is too long (' + len(name) + ' characters, max is ' + MAX_NAME_LENGTH + ')')
    else:
        for c in name:
            if (not isValidNameChar(c)):
                return (False, 'name contains an invalid character (' + c + ')')
    return True

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