#!/bin/bash

set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

# We have `|| true' here because we don't want spurious network errors holding up the server
(git pull && git submodule init && git submodule sync && git submodule update) || true

docker build . -t server
docker kill server || true
docker rm server || true
docker run -d\
  -v $DIR/logs:/opt/django/logs \
  -v $DIR/django/database:/opt/django/database \
  -v $DIR/logs:/opt/caddy/logs \
  -v $DIR/.caddy:/opt/caddy/.caddy \
  -p 80:80 -p 443:443 \
  --name server \
  server

# Shutdown once entrypoint.sh has run
shutdown now -r
