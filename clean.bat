@echo on

pushd "%~dp0"

:: Remove all of the static files
rmdir /S /Q static

:: Update SECRET_KEY
CALL python trolleyman/secret_key_gen.py

popd
