from django.shortcuts import render

def game(request):
    return render(request, 'tanks/game.html', {})
