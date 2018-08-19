
from hashlib import sha1

import json
import hmac
import logging
import os
import signal

import psutil

from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.encoding import force_bytes


logger = logging.getLogger(__name__)


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

    secret = force_bytes(settings.GITHUB_WEBHOOK_SECRET)
    msg = force_bytes(request.body)

    mac = hmac.new(secret, msg=msg, digestmod=sha1)

    digest = force_bytes(mac.hexdigest())
    if not hmac.compare_digest(digest, force_bytes(signature)):
        return HttpResponse('Invalid signature', status=401)

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
        logger.info("ping event received")
        return HttpResponse('pong')

    elif evt_name == 'push':
        # Handle push
        ref = js.get('ref')
        if ref != 'refs/heads/prod':
            logger.info("ref %r updated, ignoring" % ref)

        else:
            logger.info("ref %r updated, shutting down gunicorn" % ref)
            # prod branch has been updated

            # Find all gunicorn processes
            gunicorn_pids = [
                p.info for p in psutil.process_iter(attrs=['pid', 'name']) if 'gunicorn' in p.info['name']
            ]

            # Send SIGTERM to them
            for pid in gunicorn_pids:
                os.kill(pid, signal.SIGTERM)

            logger.info("SIGTERM sent")

        # Send thanks to Git webhooks
        return HttpResponse('Cheers, git.')

    else:
        return HttpResponseBadRequest('Unknown event: %s' % evt_name)
