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

# Install django
RUN pip install django
RUN pip install gunicorn
RUN pip install django_compressor
RUN pip install requests

# 2. Copy files
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

# Setup database
VOLUME database/

# Setup django logs volume
VOLUME logs/

# Run secret key gen
RUN python trolleyman/secret_key_gen.py

# Collect static files
RUN python manage.py collectstatic --noinput

# Compress stuff
RUN python manage.py compress

# Migrate database
RUN python manage.py migrate

# 3. Setup startup cmd
WORKDIR /
COPY startup.sh /

CMD /startup.sh
