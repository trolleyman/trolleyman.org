#!/bin/bash
# This file is the base entrypoint that is running continuously on the server.
# It reloads the repository from GitHub, and runs docker.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SELF="$( realpath "${BASH_SOURCE[0]}" )"

# Set echo
set -x

# Redirect all output to a logfile
mkdir -p "$DIR/logs"
exec > "$DIR/logs/script.log" 2>&1

cd $DIR

# We have `|| true' here because we don't want spurious network errors holding up the server
(
	git fetch &&\
	git checkout prod &&\
	git reset --hard origin/prod &&\
	git submodule init &&\
	git submodule sync &&\
	git submodule update
) || true

# Run docker
"$DIR/server_run_docker.sh"

# Exec ourselves
exec "$SELF"
