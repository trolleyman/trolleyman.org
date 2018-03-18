#!/bin/bash

# TODO: sort everything out

# Run django via gunicorn
forever gunicorn -b localhost:5000 /django/trolleyman/wsgi.py

# Run caddy

# TODO logs & cmd line parameters etc
forever caddy --conf /etc/Caddyfile --log 