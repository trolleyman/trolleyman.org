#!/bin/bash
# This file builds & runs docker
# When it finishes, we know that we need to reload everything.

# Set echo & exit on error
set -ex

# Get dir of script location
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Prune images that are older than 2 months
docker image prune --filter='until=1460h' -f

# Build server docker image
docker build "$DIR" -t server
docker stop server || true
docker rm server || true
docker run\
  -v "$DIR/logs:/opt/django/logs" \
  -v "$DIR/django/database:/opt/django/database" \
  -v "$DIR/logs:/opt/caddy/logs" \
  -v "$DIR/.caddy:/opt/caddy/.caddy" \
  -p 80:80 -p 443:443 \
  --name server \
  server

echo "Docker finished"

