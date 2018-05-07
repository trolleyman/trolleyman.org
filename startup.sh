#!/bin/bash

# TODO: sort everything out

# Run django via gunicorn
cd /django
nohup gunicorn -b localhost:5000 trolleyman.wsgi > logs/gunicorn.log &

# Run caddy
cd /caddy
# TODO logs & cmd line parameters etc
nohup caddy --conf Caddyfile --log logs/caddy.log &

# Wait for child processes to exit
wait
