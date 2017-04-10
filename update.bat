@echo on
pushd "%~dp0"

:: Update FlappyClone project
CALL "FlappyClone/update.bat"

:: Collect all of the static files
CALL python manage.py collectstatic --noinput

:: Update SECRET_KEY
CALL python trolleyman/secret_key_gen.py

popd
