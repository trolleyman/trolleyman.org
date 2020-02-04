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

# Rebuild docker compose
docker-compose build

# Take down old server & reset restart flag
docker-compose down || true  # TODO: Is this necessary?
rm -f scripts/restart_flag/restart_flag || true

# Redirect logs
docker-compose logs -f -t >logs/docker-compose.log 2>&1 &

# Start server
docker-compose up -d

# Wait for restart flag
set +x
echo "Started waiting..."
while ! [[ -e scripts/restart_flag/restart_flag ]]; do
    inotifywait -e create -e modify -e delete -e close -e open -e move --timeout 10 scripts/restart_flag >/dev/null 2>&1 || true
done
if ! [[ -e scripts/restart_flag/restart_flag ]]; then
    echo "Restart flag detected"
else
    echo "No restart flag detected, but exiting while for some reason"
fi
set -x
echo "Done waiting."
