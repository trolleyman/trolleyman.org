@echo on

:: Update FlappyClone project
CALL "%~dp0\FlappyClone\update.bat"

:: Collect all of the static files
CALL python3 manage.py collectstatic --noinput
