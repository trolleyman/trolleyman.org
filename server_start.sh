#!/bin/bash
# This file is the base entrypoint that is running continuously on the server.
# It reloads the repository from GitHub, and runs docker.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SELF="$( realpath "${BASH_SOURCE[0]}" )"

function on-exit() {
	exec "$SELF" "$@"
}
trap on-exit EXIT

# Set echo & exit on error
set -ex

# Redirect all output to a logfile
exec > "$DIR/logs/script.log" 2>&1

cd $DIR

# We have `|| true' here because we don't want spurious network errors holding up the server
(git pull && git submodule init && git submodule sync && git submodule update) || true

# Run docker
"$DIR/server_run_docker.sh"

# Exec ourselves
exec "$SELF"
