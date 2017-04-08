set -e
set -x

# Collect all of the static files
python manage.py collectstatic --noinput

# Update FlappyClone project
./FlappyClone/update.sh
