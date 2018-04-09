from django.shortcuts import render
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.http import HttpResponseRedirect, HttpResponseNotAllowed, HttpResponseBadRequest
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings

import random

import requests

DEFAULT_OPTS = { 'sitekey': settings.RECAPTCHA_PUBLIC_KEY }

def index(request):
    num_bg = 16
    i = random.randrange(num_bg)+1
    bg_url = static('homepage/images/bg/{:02}.jpg'.format(i))
    
    return render(request, 'homepage/index.html', { 'bg_url': bg_url, **DEFAULT_OPTS })

def contact_details(request):
    # Check if g-recaptcha-response is valid.
    try:
        token = request.META['HTTP_G_RECAPTCHA_RESPONSE']
    except KeyError:
        return HttpResponseBadRequest("Couldn't find key 'g-recaptcha-response'")
    
    url = 'https://www.google.com/recaptcha/api/siteverify'
    
    data = {
        'secret': settings.RECAPTCHA_PRIVATE_KEY,
        'response': token,
    }
    try:
        data['remoteip'] = request.META['HTTP_REMOTE_ADDR']
    except KeyError:
        pass # Ignore
    
    r = requests.post(url, data=data)
    if r.status_code >= 200 and r.status_code < 300:
        return render(request, 'homepage/contact_details.html', DEFAULT_OPTS)
    
    else:
        return HttpResponse(r.text, status=401)

def projects_linc(request):
    return render(request, 'homepage/projects/linc.html', DEFAULT_OPTS)

def projects_flappy(request):
    return render(request, 'homepage/projects/flappy.html', DEFAULT_OPTS)

def projects_zucchini(request):
    return render(request, 'homepage/projects/zucchini.html', DEFAULT_OPTS)

def projects_robot(request):
    return render(request, 'homepage/projects/robot.html', DEFAULT_OPTS)

# def projects_portal(request):
#     return render(request, 'homepage/projects/portal.html', DEFAULT_OPTS)

# def projects_kmeans(request):
#     return render(request, 'homepage/projects/k-means.html', DEFAULT_OPTS)

# def projects_equator(request):
#     return render(request, 'homepage/projects/equator.html', DEFAULT_OPTS)
