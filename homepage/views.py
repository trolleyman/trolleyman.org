from django.shortcuts import render
from django.contrib.staticfiles.templatetags.staticfiles import static

import random

def index(request):
    num_bg = 18
    i = random.randrange(num_bg)+1
    bg_url = static('homepage/images/bg/{:02}.jpg'.format(i))
    
    return render(request, 'homepage/index.html', {'bg_url': bg_url})
