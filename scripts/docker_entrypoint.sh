#!/bin/bash

set -ex

### Caddy ###
nohup caddy --conf Caddyfile --log logs/caddy.log >logs/caddy_script.log 2>&1

### Rocket ###
./trolleyman-org
