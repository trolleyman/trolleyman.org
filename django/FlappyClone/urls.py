from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'^api/', include('FlappyClone.api.urls'), name='api'),
    url(r'^login$', views.login, name='login'),
    url(r'^logout$', views.logout, name='logout'),
    url(r'^account$', views.account, name='account'),
    url(r'^$', views.index, name='game'),
]
