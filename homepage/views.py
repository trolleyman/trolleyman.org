from django.shortcuts import render
from django.contrib.staticfiles.templatetags.staticfiles import static
from django.http import HttpResponseRedirect, HttpResponseNotAllowed, HttpResponseBadRequest
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

import random

def index(request):
    num_bg = 16
    i = random.randrange(num_bg)+1
    bg_url = static('homepage/images/bg/{:02}.jpg'.format(i))
    
    return render(request, 'homepage/index.html', {'bg_url': bg_url})

def elements(request):
    return render(request, 'homepage/elements.html')

def projects(request):
    return render(request, 'homepage/projects.html')
