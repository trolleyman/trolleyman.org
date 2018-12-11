from django.conf.urls import url

from . import views


handler404 = 'homepage.views.handler404'
handler500 = 'homepage.views.handler500'
handler403 = 'homepage.views.handler403'
handler400 = 'homepage.views.handler400'

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^contact_details$', views.contact_details, name='contact_details'),
]

for name in views.projects:
    pattern = url(r'^projects/' + name + r'$', views.project_view(name), name='project_' + name)
    urlpatterns.append(pattern)
