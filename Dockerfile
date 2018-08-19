FROM ubuntu:18.10

# === Install stuff ===
# Update apt
RUN apt-get update

# Install python3
RUN apt-get install python3 -y
RUN python3 -V

# Install pip
RUN apt-get install python3-pip -y
RUN pip3 -V

# Update pip
RUN pip3 install --upgrade pip

# Install caddy
RUN apt-get install curl -y
RUN curl -s https://getcaddy.com | bash -s personal
RUN which caddy

# Install django
COPY django/requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY django/linc/requirements.txt requirements_linc.txt
RUN pip3 install -r requirements_linc.txt

# === Setup config ===
# Setup caddy
EXPOSE 80 443
RUN mkdir /opt/caddy
WORKDIR /opt/caddy
VOLUME logs/
COPY Caddyfile ./Caddyfile
VOLUME .caddy/
ENV CADDYPATH /opt/caddy/.caddy

# Copy django files
COPY django /opt/django
WORKDIR /opt/django

# Specify django port
ENV DJANGO_PORT=4999

# Setup database
VOLUME database/

# Setup django logs volume
VOLUME logs/

# Collect static files
RUN python3 manage.py collectstatic --noinput

# Compress stuff
RUN python3 manage.py compress --force

# === Setup startup cmd ===
WORKDIR ~
COPY entrypoint.sh ./

ENTRYPOINT ./entrypoint.sh
