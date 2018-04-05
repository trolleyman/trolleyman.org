#!/bin/bash

set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker build . -t server
docker kill server || true
docker rm server || true
docker run -d\
  -v $DIR/logs:/django/logs \
  -v $DIR/django/database:/django/database \
  -v $DIR/logs:/caddy/logs \
  -v $DIR/.caddy:/caddy/.caddy \
  -p 80:80 -p 443:443 \
  --name server \
  server
