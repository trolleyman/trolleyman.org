from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^push$', views.push),
]
