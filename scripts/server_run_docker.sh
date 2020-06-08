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

# Compile trolleyman.org
docker run \
    --rm \
    --user "$(id -u)":"$(id -g)" \
    --mount type=bind,src="$PWD",dst=/usr/src/app \
    --workdir /usr/src/app \
    --env CARGO_HOME=/usr/src/app/.cargo \
    rust:latest \
    cargo xtask dist

# Rebuild docker compose
docker-compose build

# Take down old server & reset restart flag
docker-compose down || true  # TODO: Is this necessary?
rm -rf data/restart_flag || true

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
last_heartbeat_success=$started_waiting
function should_restart() {
    if [[ -e data/restart_flag ]]; then
        return 0
    fi

    # Heartbeat
    if [[ -z "$finished_waiting" ]]; then
        now=$(date -u '+%s')
        if [[ $(( $now - $started_waiting )) -gt 120 ]]; then
            echo "Starting heartbeat detector..."
            finished_waiting=1
            last_heartbeat_success=$now
        fi
    fi

    if [[ ! -z "$finished_waiting" ]] && [[ $(( $now - $last_heartbeat )) -gt 10 ]]; then
        last_heartbeat=$now
        if ! curl -sf http://localhost/heartbeat >/dev/null; then
            echo "Heartbeat failed"
            if [[ $(( $now - $last_heartbeat_success )) -gt 30 ]]; then
                echo "Too long since last successful heartbeat. Exiting."
                return 0
            else
                echo "Waiting for proper heartbeat..."
            fi
        else
            last_heartbeat_success=$now
        fi
    fi
    return 1
}
while ! should_restart; do
    if command -v inotifywait >/dev/null 2>&1; then
        inotifywait -e create -e modify -e delete -e close -e open -e move --timeout 10 data >/dev/null 2>&1 || true
    else
        echo "inotifywait: command not found: install using \`sudo apt install inotify-tools\`" >&2
        sleep 10
    fi
done
set -x
echo "Done waiting."
