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

projects = [
    'linc',
    'flappy',
    'zucchini',
    'robot',
    # 'portal',
    # 'k-means',
    # 'equator',
]

def project_view(name):
    template = 'homepage/projects/' + name + '.html'
    return lambda request: render(request, template, {'name': name, **DEFAULT_OPTS})
