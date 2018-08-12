from django.http import HttpResponse

import json


PORT=9401

def push_hook(request):
	# A push has been triggered
	body = request.body.decode(encoding='utf-8', errors='replace')
	try:
		js = json.loads(body)
	except json.JSONDecodeError:
		return HttpResponseBadRequest('Invalid JSON')

	print(js)

	# Return a default OK response
	return HttpResponse('ok')

