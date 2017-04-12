#!/bin/bash
set -ex

pushd "$(dirname $BASH_SOURCE)" > /dev/null

# Collect all of the static files
python manage.py collectstatic --noinput

# Update SECRET_KEY
python trolleyman/secret_key_gen.py

popd > /dev/null
