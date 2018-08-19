#!/bin/bash
# This file builds & runs docker
# When it finishes, we know that we need to reload everything.

# Set echo & exit on error
set -ex

# Get dir of script location
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker build "$DIR" -t server
docker kill server || true
docker rm server || true
docker run\
  -v "$DIR/logs:/opt/django/logs" \
  -v "$DIR/django/database:/opt/django/database" \
  -v "$DIR/logs:/opt/caddy/logs" \
  -v "$DIR/.caddy:/opt/caddy/.caddy" \
  -p 80:80 -p 443:443 \
  --name server \
  server
