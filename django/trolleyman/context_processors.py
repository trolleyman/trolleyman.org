from django.conf import settings


def debug(context):
    return {'debug': settings.DEBUG}
