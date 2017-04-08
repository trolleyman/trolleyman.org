set -e
set -x

# Reset js directory
rm -rf ./js 2> /dev/null # Don't care about errors
mkdir js

# Uglify JS files
uglifyjs --mangle --wrap -o js/game.js -- src/*.js
