
# trolleyman.org
[trolleyman.org](https://trolleyman.org) is my personal website, and this repo contains all the code to make it work.

To get it up and running a `.env` file must be placed in the `django` directory, and `server_start.sh` needs to be run every reboot.

An example `.env` file is below.

The [git_hook django project](django) can be used to automatically update the server every time a branch is updated on GitHub.
For example, the [trolleyman.org](https://trolleyman.org) is hooked up to restart when the `prod` branch is updated.

## Example production `django/.env` file
```env
DEBUG=False
SECRET_KEY=<random key used by Django (can just be a random string of characters)>
RECAPTCHA_PRIVATE_KEY=<Google reCAPTCHA private key (see https://developers.google.com/recaptcha/intro)>
GITHUB_WEBHOOK_SECRET=<GitHub secret key used to verify GitHub hooks (see https://developer.github.com/webhooks)>
```

## Running locally
To run the Django project without docker, install the `requirements.txt` in the `django` folder, and run Django as usual using `manage.py`. Ensure that you are using Python 3. Virtualenv is recommended.

```bash
pip install -r requirements.txt
python manage.py runserver
```
