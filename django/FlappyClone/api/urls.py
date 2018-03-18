from django.conf.urls import url
from django.views.decorators.csrf import csrf_exempt

from . import views

urlpatterns = [
    url(r'^leaderboard$', views.leaderboard),
    url(r'^profile$', views.profile),
    url(r'^submit$', csrf_exempt(views.submit)),
]
