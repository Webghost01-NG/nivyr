# syntax=docker/dockerfile:1.7
FROM rust:1.90.0-bookworm@sha256:3914072ca0c3b8aad871db9169a651ccfce30cf58303e5d6f2db16d1d8a7e58f AS build
ARG DEVTOOL_COMMIT=5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8
ARG SOURCE_DATE_EPOCH=1760000000
LABEL org.opencontainers.image.title="Nivyr pinned zcash-devtool" \
      org.opencontainers.image.source="https://github.com/zcash/zcash-devtool" \
      org.opencontainers.image.revision="5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8" \
      org.opencontainers.image.licenses="MIT OR Apache-2.0" \
      io.nivyr.wallet.features="regtest_support"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git build-essential pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /src
RUN git init . && git remote add origin https://github.com/zcash/zcash-devtool.git && \
    git fetch --depth 1 origin "${DEVTOOL_COMMIT}" && git checkout --detach FETCH_HEAD && \
    test "$(git rev-parse HEAD)" = "${DEVTOOL_COMMIT}"
ENV CARGO_HOME=/usr/local/cargo \
    CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse \
    CARGO_HTTP_TIMEOUT=120 \
    CARGO_NET_RETRY=6 \
    SOURCE_DATE_EPOCH=1760000000
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=/src/target \
    cargo build --release --locked --features regtest_support && \
    install -D /src/target/release/zcash-devtool /out/zcash-devtool

FROM debian:bookworm-slim@sha256:3783cc01769c7b2b1b83a5c5ad96c815348e28ed7da68e2e3687004faa906251
ARG DEVTOOL_COMMIT=5a26ee854e634a4e88d1d79dab13f8fbb1eac6b8
LABEL org.opencontainers.image.title="Nivyr pinned zcash-devtool" \
      org.opencontainers.image.source="https://github.com/Webghost01-NG/nivyr" \
      org.opencontainers.image.revision="${DEVTOOL_COMMIT}" \
      org.opencontainers.image.licenses="MIT" \
      io.nivyr.wallet.source="https://github.com/zcash/zcash-devtool@${DEVTOOL_COMMIT}" \
      io.nivyr.wallet.features="regtest_support"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates libssl3 libsqlite3-0 && rm -rf /var/lib/apt/lists/* && \
    useradd --system --uid 10001 --create-home --home-dir /home/nivyr nivyr
COPY --from=build --chown=10001:10001 /out/zcash-devtool /usr/local/bin/zcash-devtool
USER 10001:10001
ENTRYPOINT ["/usr/local/bin/zcash-devtool"]
