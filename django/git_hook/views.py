import os

from hashlib import sha1

import json
import hmac

from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.encoding import force_bytes


COM_PORT=9401

@require_POST
@csrf_exempt
def push(request):
    # A push has been triggered
    # Get signature
    header_signature = request.META.get('HTTP_X_HUB_SIGNATURE')
    if header_signature is None:
        return HttpResponseBadRequest('Required header X-Hub-Signature not found')

    # Validate signature
    sha_name, signature = header_signature.split('=')
    if sha_name != 'sha1':
        return HttpResponseBadRequest('Operation not supported')

    mac = hmac.new(force_bytes(settings.GITHUB_WEBHOOK_KEY), msg=force_bytes(request.body), digestmod=sha1)
    if not hmac.compare_digest(force_bytes(mac.hexdigest()), force_bytes(signature)):
        return HttpResponseForbidden('Invalid signature', status=401)

    # Decode JSON
    body = request.body.decode(encoding='utf-8', errors='replace')
    try:
        js = json.loads(body)
    except json.JSONDecodeError:
        return HttpResponseBadRequest('Invalid JSON')

    # Get event name
    evt_name = request.META.get('HTTP_X_GITHUB_EVENT')
    if evt_name is None:
        return HttpResponseBadRequest('Required header X-Github-Event not found')

    elif evt_name == 'ping':
        # Handle ping event
        return HttpResponse('pong')
    
    elif evt_name == 'push':
        # Handle push
        ref = js.get('ref')
        
        # Signal that there has been a push request
        # TODO
    
    else:
        return HttpResponseBadRequest('Unknown event: %s' % evt_name)
