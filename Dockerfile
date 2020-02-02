## Rust
FROM rustlang/rust:nightly AS rust

# Install std for wasm32-unknown-unknown
RUN rustup target add wasm32-unknown-unknown

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
RUN cd tanks && cargo build --release --no-default-features --features=wee_alloc

# Build main project deps
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release

# Build xtask runner
COPY xtask/src xtask/src
RUN cd xtask && cargo build

# Build project
COPY . .
RUN rm -f xtask/target/debug/deps/trolleyman_org_xtask*
RUN cargo xtask dist

## Main build
FROM debian:latest

# Install trolleyman.org
RUN mkdir -p /trolleyman.org
WORKDIR /trolleyman.org
COPY --from=rust /usr/src/app/target/dist/* /trolleyman.org/
COPY ./scripts/docker_entrypoint.sh ./
RUN mkdir -p ./restart_flag

EXPOSE 80 443
VOLUME /trolleyman.org/logs
VOLUME /trolleyman.org/database
VOLUME /trolleyman.org/restart_flag

ENTRYPOINT ["./docker_entrypoint.sh"]
CMD ["./trolleyman-org"]
