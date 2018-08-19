#!/bin/bash

set -x

### Caddy ###
cd /opt/caddy

# Run caddy
caddy --conf Caddyfile --log logs/caddy.log &

### Django ###
cd /opt/django

# Migrate the database
python manage.py migrate

# Run django via gunicorn & wait for this to exit
gunicorn -b localhost:${DJANGO_PORT} trolleyman.wsgi > logs/gunicorn.log 2>&1
