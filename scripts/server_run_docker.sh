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

# Start server
docker-compose up -d

# Redirect logs
docker-compose logs -f -t >logs/docker-compose.log 2>&1 &

# Wait for restart flag
set +x
echo "Started waiting..."
started_waiting=$(date -u '+%s')
finished_waiting=
last_heartbeat=$started_waiting
function should_restart() {
    if [[ -e scripts/restart_flag/restart_flag ]]; then
        return 0
    fi

    # Heartbeat
    if [[ -z "$finished_waiting" ]]; then
        now=$(date -u '+%s')
        if [[ $(( $now - $started_waiting )) -gt 120 ]]; then
            echo "Starting heartbeat detector..."
            finished_waiting=1
        fi
    fi

    if [[ ! -z "$finished_waiting" ]] && [[ $(( $now - $last_heartbeat )) -gt 10 ]]; then
        last_heartbeat=$now
        if ! curl -sf http://localhost/heartbeat >/dev/null; then
            echo "Heartbeat failed, exiting wait..."
            return 0
        fi
    fi

    return 1
}
while ! should_restart; do
    inotifywait -e create -e modify -e delete -e close -e open -e move --timeout 10 scripts/restart_flag >/dev/null 2>&1 || true
done
set -x
echo "Done waiting."
