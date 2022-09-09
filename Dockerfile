FROM node:18.9.0-alpine3.15 AS base

WORKDIR /misskey

FROM base AS builder

RUN apk add --no-cache \
    autoconf \
    automake \
    file \
    g++ \
    gcc \
    libc-dev \
    libtool \
    make \
    nasm \
    pkgconfig \
    python3 \
    zlib-dev \
		git

COPY . ./

RUN yarn install --immutable

ENV NODE_ENV=production

RUN yarn build

FROM base AS runner

RUN apk add --no-cache \
    ffmpeg \
    tini

ENTRYPOINT ["/sbin/tini", "--"]

COPY --from=builder /misskey/node_modules ./node_modules
COPY --from=builder /misskey/built ./built
COPY --from=builder /misskey/.yarn ./.yarn
COPY --from=builder /misskey/.yarnrc.yml ./
COPY . ./

CMD ["yarn", "migrateandstart"]
