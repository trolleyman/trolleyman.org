"""
Django settings for trolleyman project.

Generated by 'django-admin startproject' using Django 1.10.4.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os

import decouple  # django-decouple


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = decouple.config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = decouple.config('DEBUG', default=False, cast=bool)


if not DEBUG:
    # Production
    ALLOWED_HOSTS = [
        '.trolleyman.org',
        'trolleyman.org',
        '.callumgtolley.uk',
        'callumgtolley.uk',
        'localhost',
        '138.68.156.104',
        '2a03:b0c0:1:d0::a00:b001',
    ]
    CONN_MAX_AGE = None
    ADMINS = [('Callum Tolley', 'cgtrolley@gmail.com')]
else:
    # Debug
    ALLOWED_HOSTS = [
        '*'
    ]

LOGS_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOGS_DIR):
    os.mkdir(LOGS_DIR)
LOG_PATH = os.path.join(LOGS_DIR, 'django.log')

INTERNAL_IPS = (
    '127.0.0.1',
)

DEFAULT_FROM_EMAIL = 'admin@callumgtolley.uk'
SERVER_EMAIL = 'admin@callumgtolley.uk'

# Application definition

INSTALLED_APPS = [
    'git_hook.apps.GitHookConfig',
    'FlappyClone.apps.FlappyCloneConfig',
    'linc.apps.LincConfig',
    'homepage.apps.HomepageConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'compressor',  # django-compressor
]

if not DEBUG:
    RECAPTCHA_PUBLIC_KEY = '6LfdxE8UAAAAAN1sVEiQVDVomnIyvz-Pa4FstoHT'
    RECAPTCHA_PRIVATE_KEY = decouple.config('RECAPTCHA_PRIVATE_KEY')
else:
    # !!!TEST KEYS - Do not use in prod!!!
    RECAPTCHA_PUBLIC_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
    RECAPTCHA_PRIVATE_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'

# Get Github webhooks secret
GITHUB_WEBHOOK_SECRET = decouple.config('GITHUB_WEBHOOK_SECRET').encode('utf-8')

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'trolleyman.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'trolleyman.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'trolleyman.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'database/db.sqlite3'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-gb'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, "static/static")

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',  # django-compressor
]

LOGIN_URL = 'login'
LOGOUT_REDIRECT_URL = 'login'

COMPRESS_FILTERS = {
    'css': [
        'compressor.filters.css_default.CssAbsoluteFilter'
        'compressor.filters.yuglify.YUglifyCSSFilter'
    ],
    'js': [
        'compressor.filters.jsmin.JSMinFilter'
    ]
}

if DEBUG:
    COMPRESS_OFFLINE = False
else:
    COMPRESS_OFFLINE = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': LOG_PATH,
            'formatter': 'verbose',
        },
        'rotating_file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_PATH,
            'maxBytes': 1024*1024*5,  # 5 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'standard',
        },
    },
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
        'verbose': {
            'format': '%(asctime)s [%(levelname)s] (PID %(process)d, TID %(thread)d) %(module)s - %(name)s: %(message)s'
        },
    },
    'loggers': {},
}
if DEBUG:
    LOGGING['loggers'] = {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
        },
    }
else:
    LOGGING['loggers'] = {
        'django': {
            'handlers': ['rotating_file'],
            'level': 'DEBUG',
        },
        'django.request': {
            'handlers': ['rotating_file'],
            'level': 'DEBUG',
        },
    }
