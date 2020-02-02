#!/bin/bash

mkdir -p logs
exec > logs/docker_entrypoint.log 2>&1

set -x

### Caddy ###
caddy --conf Caddyfile --log logs/caddy.log >logs/caddy_script.log 2>&1 &

### Rocket ###
./trolleyman-org
