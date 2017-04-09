from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'^api/', include('FlappyClone.api.urls'), name='api'),
    url(r'^login$', views.login, name='login'),
    url(r'^$', views.index, name='index'),
]
