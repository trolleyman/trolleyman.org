FROM ubuntu:18.10

# === Install stuff ===
# Update apt, install dependencies
RUN apt-get update &&\
	apt-get install -y python3 python3-pip &&\
	pip3 install --upgrade pip &&\
	apt-get install -y nodejs npm &&\
	apt-get install -y yuglify &&\
	apt-get install -y curl &&\
	curl https://getcaddy.com -sSf | bash -s personal &&\
	curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable --profile minimal &&\
	apt-get clean

RUN python3 -V
RUN pip3 -V
RUN npm -v
RUN nodejs -v
RUN caddy -version
RUN rustup -V
RUN rustc -V
RUN cargo -V

# Install django
COPY django/requirements.txt requirements.txt
RUN pip3 --no-cache-dir install -r requirements.txt
COPY django/linc/requirements.txt requirements_linc.txt
RUN pip3 --no-cache-dir install -r requirements_linc.txt
COPY django/FlappyClone/requirements.txt requirements_FlappyClone.txt
RUN pip3 --no-cache-dir install -r requirements_FlappyClone.txt

# Compile dependencies of the Rocket server
#TODO - see https://github.com/rust-lang/cargo/issues/2644#issuecomment-335272535

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

# Specify ports
ENV DJANGO_PORT=4999
ENV ROCKET_PORT=4998

# Setup database
VOLUME database/

# Setup django logs volume
VOLUME logs/

# Collect static files
RUN mkdir -p /var/www/callumgtolley.uk/static
RUN python3 manage.py collectstatic --noinput

# Compress stuff
RUN python3 manage.py compress --force

# Compile Rocket server & copy over binary
# TODO

# === Setup startup cmd ===
WORKDIR /root/
COPY scripts/docker_entrypoint.sh /root/docker_entrypoint.sh

ENTRYPOINT ["/root/docker_entrypoint.sh"]
