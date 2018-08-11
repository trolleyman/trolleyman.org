#!/bin/bash

set -ex

### Django ###
cd /django

# Run secret key gen (if there's a key already, this won't overwrite it)
python trolleyman/secret_key_gen.py

# Migrate the database
python manage.py migrate

# Run django via gunicorn
forever start -l logs/gunicorn.log -e logs/gunicorn.log -o logs/gunicorn.log -c /usr/bin/env -- nohup gunicorn -b localhost:5000 trolleyman.wsgi

### Caddy ###
cd /caddy

# Run caddy
forever start -l logs/caddy.log -e logs/caddy.log -o logs/caddy.log -c /usr/bin/env -- nohup caddy --conf Caddyfile
