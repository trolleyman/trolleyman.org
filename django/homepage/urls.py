from django.conf.urls import url
from django.views.generic import TemplateView
from django.views.defaults import page_not_found, server_error
from django.http import Http404

from django.conf import settings

from . import views


handler500 = 'homepage.views.handler500'
handler400 = 'homepage.views.handler400'
handler403 = 'homepage.views.handler403'
handler404 = 'homepage.views.handler404'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^contact_details$', views.contact_details, name='contact_details'),
]

for name in views.projects:
    pattern = url(r'^projects/' + name + r'$', views.project_view(name), name='project_' + name)
    urlpatterns.append(pattern)

if settings.DEBUG:
    urlpatterns += [
        url(r'^error_400$', views.handler400),
        url(r'^error_403$', views.handler403),
        url(r'^error_404$', views.handler404),
        url(r'^error_500$', views.handler500),
    ]
