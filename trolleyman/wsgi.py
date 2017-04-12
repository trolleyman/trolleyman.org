"""
WSGI config for trolleyman project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os, sys

# Add the trolleyman project path into the sys.path
sys.path.append('/trolleyman.org/trolleyman')

# Add the virtualenv site-packages path to the sys.path
sys.path.append('/trolleyman.org/venv/Lib/site-packages')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "trolleyman.settings")

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
