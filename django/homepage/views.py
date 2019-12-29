from django.shortcuts import render
from django.templatetags.static import static
from django.http import Http404, HttpResponse
from django.conf import settings

import random

import requests


def index(request):
    num_bg = 16
    i = random.randrange(num_bg)+1
    bg_url = static('homepage/images/bg/{:02}.jpg'.format(i))

    return render(request, 'homepage/index.html', {
        'bg_url': bg_url, 'sitekey': settings.RECAPTCHA_PUBLIC_KEY,
    })


def contact_details(request):
    # Check if g-recaptcha-response is valid.
    try:
        token = request.META['HTTP_G_RECAPTCHA_RESPONSE']
    except KeyError:
        return error400_bad_request(request, "Couldn't find key 'g-recaptcha-response'")

    url = 'https://www.google.com/recaptcha/api/siteverify'

    data = {
        'secret': settings.RECAPTCHA_PRIVATE_KEY,
        'response': token,
    }
    try:
        data['remoteip'] = request.META['HTTP_REMOTE_ADDR']
    except KeyError:
        pass  # Ignore

    r = requests.post(url, data=data)
    if r.status_code >= 200 and r.status_code < 300:
        return render(request, 'homepage/contact_details.html', {
            'sitekey': settings.RECAPTCHA_PUBLIC_KEY
        })

    else:
        return error400_bad_request(request, 'RECAPTCHA error: ' + r.text)



projects = [
    'dissertation',
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
    return lambda request: render(request, template, {'name': name})


# Callable error functions
def error400_bad_request(request, msg=None):
    return handler400(request, msg)


def error404_not_found(request, msg=None):
    raise Error404(msg)


# Error handlers
def handler400(request, *args, **kwargs):
    msg = ''
    if len(args) >= 1:
        msg = str(args[0])
    return render(request, 'homepage/error.html', status=400, context={
        'status': 400,
        'title': 'Bad Request',
        'msg': msg,
    })


def handler403(request, *args, **kwargs):
    msg = ''
    if len(args) >= 1:
        msg = str(args[0])
    return render(request, 'homepage/error.html', status=403, context={
        'status': 403,
        'title': 'Forbidden',
        'msg': msg,
    })


def handler404(request, *args, **kwargs):
    msg = ''
    if len(args) >= 1:
        msg = str(args[0])
    return render(request, 'homepage/error.html', status=404, context={
        'status': 404,
        'title': 'Not Found',
        'msg': msg,
    })


def handler500(request):
    return render(request, 'homepage/error.html', status=500, context={
        'status': 500,
        'title': 'Internal Server Error'
    })
