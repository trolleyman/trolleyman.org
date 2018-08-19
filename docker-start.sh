#!/bin/bash

set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export COM_PORT_INSIDE=9401
export COM_PORT_OUTSIDE=9402

cd $DIR/django

# We have `|| true' here because we don't want spurious network errors holding up the server
(git pull && git submodule init && git submodule sync && git submodule update) || true

cd $DIR

docker build . -t server
docker kill server || true
docker rm server || true
docker run -d\
  -v $DIR/logs:/django/logs \
  -v $DIR/django/database:/django/database \
  -v $DIR/logs:/caddy/logs \
  -v $DIR/.caddy:/caddy/.caddy \
  -p 80:80 -p 443:443 -p $COM_PORT_INSIDE:$COM_PORT_OUTSIDE/tcp \
  -e COM_PORT=$COM_PORT_INSIDE \
  --name server \
  server

export COM_PORT=$COM_PORT_OUTSIDE
python3 handle_docker.py
