FROM python:3

# 1. Install stuff
# Install caddy # TODO: test
RUN apt-get install caddy -y

# Install forever # TODO: test
RUN apt-get install forever -y

# Install django
RUN mkdir /django
WORKDIR /django

COPY django/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 2. Copy files
# Copy django files
COPY django/ *

# Collect static files
RUN python manage.py staticfiles
VOLUME static/

# Setup database
RUN mkdir -p database
VOLUME database/

# Setup django logs volume
VOLUME logs/

# Setup caddy
WORKDIR /caddy
EXPOSE 80 443
# TODO
COPY Caddyfile /etc/Caddyfile

# 3. Run everything
WORKDIR /
COPY startup.sh /

CMD /update.sh
