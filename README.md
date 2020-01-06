
# trolleyman.org
[trolleyman.org](https://trolleyman.org) is my personal website, and this repo contains all the code to make it work.

To get it up and running a [`.env`](#example-production-djangoenv-file) file must be placed in the [`django`](django) directory, and [`server_start.sh`](server_start.sh) needs to be run every reboot.

The [git_hook/push endpoint](django/git_hook) can be used to automatically update the server every time a branch is updated on GitHub.
For example, [trolleyman.org](https://trolleyman.org) is hooked up to restart when the [`prod`](https://github.com/trolleyman/trolleyman.org/tree/prod) branch of this repo is updated.

## Prerequisites
- nodejs
- npm
- TypeScript
- Consult the [Dockerfile](Dockerfile) if there are any errors

## Running locally
To run the Django project without docker, ensure the [prerequisites](#prerequisites) are installed, run the commands below from the root of the repo.
Ensure that you are using Python 3. [Virtualenv](https://virtualenv.pypa.io/en/latest/) is recommended.

```bash
cd django

# Install python requirements
pip install -r requirements.txt
pip install -r linc/requirements.txt
pip install -r FlappyClone/requirements.txt

# Migrate database (update database structure)
python manage.py migrate

# Run dev server
python manage.py runserver
```

## Example production `django/.env` file
```
DEBUG=False
SECRET_KEY=<random key used by Django (this will be auto-generated if not specified)>
RECAPTCHA_PRIVATE_KEY=<Google reCAPTCHA private key (see https://developers.google.com/recaptcha/intro)>
GITHUB_WEBHOOK_SECRET=<GitHub secret key used to verify GitHub hooks (see https://developer.github.com/webhooks)>
```

## Example development `django/.env` file
```
DEBUG=True
SECRET_KEY=<random key used by Django (this will be auto-generated if not specified)>
```
