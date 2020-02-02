#!/bin/bash
# This file builds & runs docker
# When it finishes, we know that we need to reload everything.

# Set echo & exit on error
set -ex

# Get dir of script location
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "$DIR"

# Prune images that are older than 2 months
docker image prune --filter='until=1460h' -f

# Build server docker image
docker build -t server "$DIR"

# Stop old server, and rebuild anew
docker stop server || true
docker rm server || true
rm -f "$DIR/scripts/restart_flag/*" || true
docker run --rm \
  -d \
  -v "$DIR/logs:/trolleyman.org/logs" \
  -v "$DIR/database:/trolleyman.org/database" \
  -v "$DIR/.caddy:/trolleyman.org/.caddy" \
  -v "$DIR/scripts/restart_flag:/trolleyman.org/restart_flag" \
  -p 80:80 -p 443:443 \
  --name server \
  server

# Wait for restart flag
set +x
echo "Started waiting..."
while ! [[ -e "$DIR/scripts/restart_flag/restart_flag" ]]; do
    inotifywait -e create -e modify -e delete -e close -e open -e move --timeout 10 "$DIR/scripts/restart_flag" >/dev/null 2>&1 || true
done
if ! [[ -e "$DIR/scripts/restart_flag/restart_flag" ]]; then echo "Restart flag detected"; else echo "no restart, but exiting while -- why??"; fi
echo "Done waiting."
