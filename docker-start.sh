#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

docker build . -t server
docker run \
  -v $DIR/logs:/django/logs \
  -v $DIR/django/database:/django/database \
  -v $DIR/logs:/caddy/logs \
  -v $DIR/.caddy:/caddy/.caddy \
  server
