#!/bin/bash

set -x

exec > "$DIR/logs/docker_entrypoint.log" 2>&1

### Caddy ###
caddy --conf Caddyfile --log logs/caddy.log >logs/caddy_script.log 2>&1 &

### Rocket ###
./trolleyman-org
