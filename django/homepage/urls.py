from django.conf.urls import include, url
from django.contrib import admin

from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^contact_details$', views.contact_details),
]

for name in views.projects:
    pattern = url(r'^projects/' + name + r'$', views.project_view(name))
    urlpatterns.append(pattern)
