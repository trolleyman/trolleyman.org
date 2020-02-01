## Rust
FROM rustlang/rust:nightly AS rust

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Buid xtask deps
RUN mkdir xtask
COPY Cargo.{toml,lock} xtask/
RUN mkdir xtask/src && echo "fn main() {}" > xtask/src/main.rs
RUN cd xtask && cargo build --release

# Build tanks deps
RUN mkdir tanks
COPY Cargo.{toml,lock} tanks/
RUN mkdir tanks/src && echo "fn main() {}" > tanks/src/main.rs
RUN cd tanks && cargo build --release

# Build main project deps
COPY Cargo.{toml,lock} .
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# Build xtask runner
COPY xtask ./
RUN cd xtask && cargo build

# Build project
RUN cargo xtask dist

## Caddy
FROM ubuntu:18.04 AS caddy

RUN apt update &&\
    apt install curl &&\
    curl https://getcaddy.com | bash -s personal

## Main build
FROM ubuntu:18.04 AS main
COPY --from caddy /usr/local/bin/caddy /usr/local/bin/caddy

RUN mkdir -p /trolleyman.org
WORKDIR /trolleyman.org
COPY --from rust /usr/src/app/target/dist /trolleyman.org/

ENV ACME_AGREE=true
