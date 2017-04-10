@echo on

:: Navigate to js files dir
pushd "%~dp0\static\FlappyClone"

:: Reset js directory
rmdir /S /Q js
mkdir js

:: Uglify JS files
CALL uglifyjs --mangle --wrap -o js/game.js -- src/*.js src/game/*.js src/common/*.js

:: Reset dir
popd
