from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import get_user_model, authenticate, login as auth_login, logout as auth_logout
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.contrib.auth.models import User
from django.conf.urls import url
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .forms import *

def index(request):
    return render(request, 'FlappyClone/game.html', {})

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect(reverse('login'))

def login(request):
    # Get URL to redirect to upon succesful logging in/out
    if request.method == 'GET':
        redirect_url = request.GET.get('next', None)
    elif request.method == 'POST':
        redirect_url = request.POST.get('next', reverse('game'))
    
    # If this is a POST request we will process the form data
    if request.method == 'POST' and request.POST.get('action', '') == 'login':
        login_form = LoginForm(request.POST)
        
        # If login form is valid, try to login
        if login_form.is_valid():
            try:
                # Get user for username entered
                username = login_form.cleaned_data['username']
                password = login_form.cleaned_data['password']
                user = get_user_model().objects.get(username__exact=username)
                
                # Check if user is active
                if not user.is_active:
                    login_form.add_error('username', 'User is not active')
                else:
                    # Login
                    user = authenticate(username=username, password=password)
                    if user is not None:
                        auth_login(request, user)
                        return HttpResponseRedirect(redirect_url)
                    else:
                        login_form.add_error('password', 'Invalid password.')
                
            except ObjectDoesNotExist:
                login_form.add_error('username', 'User does not exist.')
        
        signup_form = SignupForm()
        
    elif request.method == 'POST' and request.POST.get('action', '') == 'signup':
        signup_form = SignupForm(request.POST)
        
        # If signup form is valid, signup and redirect to signup url
        if signup_form.is_valid():
            try:
                # Get form details
                username = signup_form.cleaned_data['username']
                password = signup_form.cleaned_data['password']
                email = signup_form.cleaned_data['email']
                
                # Ensure that user is not already in the system
                try:
                    user = get_user_model().objects.get(username__exact=username)
                except ObjectDoesNotExist:
                    # This is what we want
                    pass
                else:
                    signup_form.add_error('username', 'Username taken.')
                    raise ValueError()
                
                # Ensure that the email is not already in the system
                try:
                    user = get_user_model().objects.get(email__exact=email)
                except ObjectDoesNotExist:
                    # This is what we want
                    pass
                else:
                    signup_form.add_error('email', 'Email address taken.')
                    raise ValueError()
                
                # Create user
                user = User.objects.create_user(username, email, password)
                
                # Login user
                auth_login(request, user)
                return HttpResponseRedirect(redirect_url)
            except ValueError:
                pass
        
        login_form = LoginForm()
    
    else:
        login_form = LoginForm()
        signup_form = SignupForm()
    
    return render(request, 'FlappyClone/login.html', {'login_form': login_form, 'signup_form': signup_form, 'next': redirect_url})

@login_required
def account(request):
    return render(request, 'FlappyClone/account.html', {})
