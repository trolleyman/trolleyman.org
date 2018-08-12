#!/bin/bash

set -x

### Django ###
cd /django

# Run secret key gen (if there's a key already, this won't overwrite it)
python trolleyman/secret_key_gen.py

# Migrate the database
python manage.py migrate

# Run django via gunicorn
gunicorn -b localhost:${DJANGO_PORT} trolleyman.wsgi > logs/gunicorn.log 2>&1 &

### Caddy ###
cd /caddy

# Run caddy
caddy --conf Caddyfile --log logs/caddy.log &

# Wait for child processes to exit
wait
