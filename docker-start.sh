#!/bin/bash

set -ex

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export COM_PORT_INSIDE=9401
export COM_PORT_OUTSIDE=9402

cd $DIR/django

git pull || true # We don't want spurious network errors holding up the server

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
