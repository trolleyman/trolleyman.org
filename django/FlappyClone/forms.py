from django import forms

from .api.validation import *

import logging
import pprint

class LoginForm(forms.Form):
    username = forms.CharField(max_length=USERNAME_MAX_LENGTH, validators=USERNAME_VALIDATORS, help_text=USERNAME_HELP_TEXT)
    password = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=PASSWORD_VALIDATORS)

class SignupForm(forms.Form):
    username = forms.CharField(max_length=USERNAME_MAX_LENGTH, validators=USERNAME_VALIDATORS, help_text=USERNAME_HELP_TEXT)
    email = forms.CharField(max_length=EMAIL_MAX_LENGTH, validators=EMAIL_VALIDATORS)
    email_confirm = forms.CharField(max_length=EMAIL_MAX_LENGTH, validators=[])
    password = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=PASSWORD_VALIDATORS)
    password_confirm = forms.CharField(max_length=PASSWORD_MAX_LENGTH, widget=forms.PasswordInput(), validators=[])
    
    def clean(self):
        """
        Ensure that confirm fields are equal.
        """
        ## self.cleaned_data = super(SignupForm, self).clean()
        ## logging.getLogger(__name__).error('self::: ' + pprint.pformat(self.__dict__))
        email = self.data['email']
        email_confirm = self.data['email_confirm']
        password = self.data['password']
        password_confirm = self.data['password_confirm']
        
        if email != email_confirm:
            self.add_error('email_confirm', 'Emails are not equal.')
        if password != password_confirm:
            self.add_error('password_confirm', 'Passwords are not equal.')
        
