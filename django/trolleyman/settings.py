
if not DEBUG:
    # Production
    ALLOWED_HOSTS = [
        '.trolleyman.org',
        'trolleyman.org',
        '.callumgtolley.uk',
        'callumgtolley.uk',
        '138.68.156.104',
        '2a03:b0c0:1:d0::a00:b001',
        'localhost',
        '127.0.0.1',
        '::1'
    ]
    CONN_MAX_AGE = None
    ADMINS = [('Callum Tolley', 'cgtrolley@gmail.com')]
else:
    # Debug
    ALLOWED_HOSTS = [
        'localhost',
        '127.0.0.1',
        '::1'
    ]

INTERNAL_IPS = [
    '127.0.0.1',
    '::1'
]

# Application definition

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
            'level': 'INFO',
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
