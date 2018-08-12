import os

from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

import json
import hmac


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, 'keys/GIT_REFRESH_SECRET'), 'r') as f:
	hex = f.read().strip()
	SECRET = bytearray.fromhex(hex)

PORT=9401

@csrf_exempt
def push(request):
	# A push has been triggered
	# Get signature
	try:
		sig = request.META['HTTP_X_HUB_SIGNATURE']
	except KeyError:
		return HttpResponseBadRequest('Required header X-Hub-Signature not found')

	# Validate signature
	if not is_signature_valid(sig, request.body):
		ret = HttpResponse('Invalid signature')
		ret.status_code = 401
		return ret

	# Decode JSON
	body = request.body.decode(encoding='utf-8', errors='replace')
	try:
		js = json.loads(body)
	except json.JSONDecodeError:
		return HttpResponseBadRequest('Invalid JSON')

	# Get event name
	print(request.META)
	try:
		evt_name = request.META['HTTP_X_GITHUB_EVENT']
	except KeyError:
		return HttpResponseBadRequest('Required header X-Github-Event not found')

	# Get keys from json
	try:
		ref = js['ref']

	except KeyError:
		return HttpResponseBadRequest('Invalid JSON')

	# Signal that there has been a push request
	# TODO

	# Return a default OK response
	return HttpResponse('ok')

def is_signature_valid(sig, body):
	digest = hmac.new(SECRET, msg=body, digestmod='sha1').hexdigest()
	calc_sig = 'sha1=%s' % digest
	import logging
	log = logging.getLogger(__name__)
	log.warning('calc_sig: %r' % calc_sig)
	log.warning('sig     : %r' % sig)
	return hmac.compare_digest(sig, calc_sig)

