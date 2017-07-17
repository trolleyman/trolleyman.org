from django.conf.urls import include, url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^elements$', views.elements),
    url(r'^projects/linc$', views.projects_linc),
    url(r'^projects/flappy$', views.projects_flappy),
]