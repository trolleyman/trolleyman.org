#!/bin/bash

set -ex

cd /trolleyman.org

### Caddy ###
caddy --conf Caddyfile --log logs/caddy.log 2>&1 > logs/caddy_script.log &

### Rocket ###
./trolleyman-org
