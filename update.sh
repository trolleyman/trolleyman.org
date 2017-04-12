#!/bin/bash
set -ex

pushd "$(dirname $BASH_SOURCE)" > /dev/null

# Update SECRET_KEY
python3 trolleyman/secret_key_gen.py

# Migrate database
python3 manage.py migrate

# Collect all of the static files
python3 manage.py collectstatic --noinput

popd > /dev/null
