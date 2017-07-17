from django.conf.urls import include, url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^elements$', views.elements),
    url(r'^projects$', views.projects),
]