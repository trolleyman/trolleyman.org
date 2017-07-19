#!/bin/bash
set -ex

pushd "$(dirname $BASH_SOURCE)" > /dev/null

# Activate venv
source venv/bin/activate

# Stop server
sudo apachectl stop

# Update SECRET_KEY
python3 trolleyman/secret_key_gen.py

# Migrate database
python3 manage.py migrate

# Collect all of the static files
python3 manage.py collectstatic --noinput

# Restart server
sudo apachectl start

# Deactivate venv
deactivate

popd > /dev/null
