@echo on

set dir=%~dp0
set dir=%dir:~0,-1%

docker build "%dir%" -t server || exit 1
docker kill server
docker rm server
docker run -d^
 -v "%dir%\logs:/django/logs"^
 -v "%dir%\django\database:/django/database"^
 -v "%dir%\logs:/caddy/logs"^
 -v "%dir%\.caddy:/caddy/.caddy"^
 -p 80:80 -p 443:443^
 --name server^
 server || exit 1
