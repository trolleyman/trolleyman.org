## Caddy
FROM ubuntu:18.04 AS caddy

RUN apt-get update &&\
    apt-get install curl -y &&\
    curl https://getcaddy.com | bash -s personal

## Rust
FROM rustlang/rust:nightly AS rust

# Install wasm-bindgen
RUN cargo install wasm-bindgen-cli

# Make app dir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Buid xtask deps
RUN mkdir xtask
COPY xtask/Cargo.toml xtask/Cargo.lock xtask/
RUN mkdir xtask/src && echo "fn main() {}" > xtask/src/main.rs
RUN cd xtask && cargo build

# Build tanks deps
RUN mkdir tanks
COPY tanks/Cargo.toml tanks/Cargo.lock tanks/
RUN mkdir tanks/src && echo "" > tanks/src/lib.rs
RUN cd tanks && cargo build --release

# Build main project deps
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# Build xtask runner
COPY xtask/src xtask/src
RUN cd xtask && cargo build

# Build project
COPY . .
RUN cargo xtask dist

## Main build
FROM ubuntu:18.04
RUN apt-get update &&\
    apt-get install inotify-tools -y

COPY --from=caddy /usr/local/bin/caddy /usr/local/bin/caddy

RUN mkdir -p /trolleyman.org
WORKDIR /trolleyman.org
COPY --from=rust /usr/src/app/target/dist/* /trolleyman.org/
COPY ./scripts/*.sh ./
RUN mkdir -p ./scripts/restart_flag

ENV ACME_AGREE=true

ENTRYPOINT ["docker_entrypoint.sh"]

