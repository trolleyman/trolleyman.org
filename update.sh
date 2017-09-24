#!/bin/bash
set -ex

pushd "$(dirname $BASH_SOURCE)" > /dev/null

# Lock
lockdir=./.update-lock
mkdir $lockdir  || {
    echo "Lock directory exists"
    popd
    exit 1
}
# take pains to remove lock directory when script terminates
trap "rmdir $lockdir" EXIT INT KILL TERM

sudo chown -R www-data:www-data . /var/log/apache2/
sudo chmod -R g=u . /var/log/apache2/

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

# Compress everything
python3 manage.py compress

# Restart server
sudo apachectl start

# Deactivate venv
deactivate

popd > /dev/null
