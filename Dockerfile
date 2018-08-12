FROM python:3

# 1. Install stuff
RUN curl -s https://getcaddy.com | bash -s personal
RUN which caddy

# Install npm
RUN apt-get update
RUN apt-get install nodejs -y
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get install npm -y
RUN nodejs -v

# Install forever
RUN npm install -g forever

# Update pip
RUN pip install --upgrade pip

# Install django
COPY django/requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY django/linc/requirements.txt requirements_linc.txt
RUN pip install -r requirements_linc.txt

# 2. Setup config
# Setup caddy
EXPOSE 80 443
RUN mkdir /caddy
WORKDIR /caddy
VOLUME logs/
COPY Caddyfile ./Caddyfile
VOLUME .caddy/
ENV CADDYPATH /caddy/.caddy

# Copy django files
COPY django /django
WORKDIR /django

# Specify django port
ENV DJANGO_PORT=4999

# Setup database
VOLUME database/

# Setup django logs volume
VOLUME logs/

# Collect static files
RUN python manage.py collectstatic --noinput

# Compress stuff
RUN python manage.py compress

# 3. Setup startup cmd
WORKDIR ~
COPY entrypoint.sh ./

ENTRYPOINT ./entrypoint.sh
