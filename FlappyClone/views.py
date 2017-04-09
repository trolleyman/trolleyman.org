from django.shortcuts import render
from django.http import HttpResponse

from .api.lib import MAX_NAME_LENGTH

def index(request):
    return render(request, 'FlappyClone/index.html', {})

def login(request):
    return render(request, 'FlappyClone/login.html', {'max_name_length': MAX_NAME_LENGTH})
