# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.234.0/containers/rust/.devcontainer/base.Dockerfile

# [Choice] Debian OS version (use bullseye on local arm64/Apple Silicon): buster, bullseye
ARG VARIANT="buster"
FROM mcr.microsoft.com/vscode/devcontainers/rust:0-${VARIANT}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        mariadb-client \
        imagemagick

ENV WASMTIME_VERSION=0.37.0
RUN curl -L https://github.com/bytecodealliance/wasmtime/releases/download/v${WASMTIME_VERSION}/wasmtime-v${WASMTIME_VERSION}-x86_64-linux.tar.xz \ 
    | tar -xJ --wildcards --no-anchored --strip-components 1 -C /usr/bin wasmtime

USER vscode

RUN rustup target add wasm32-wasi
RUN rustup component add rustfmt rust-src clippy

RUN cargo install cargo-wasi cargo-expand && \
    cargo install --git https://github.com/bytecodealliance/wit-bindgen wit-bindgen-cli

RUN curl -L https://fly.io/install.sh | sh
ENV FLYCTL_INSTALL="/home/vscode/.fly"
ENV PATH="$FLYCTL_INSTALL/bin:$PATH"