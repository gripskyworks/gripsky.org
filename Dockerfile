FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    GRIPSKY_DB_PATH=/app/data/gripsky.sqlite

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY --from=build /app/dist/standalone/ ./
COPY server-selfhost.mjs ./server-selfhost.mjs
COPY scripts ./scripts

RUN mkdir -p /app/data && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "--disable-warning=ExperimentalWarning", "server-selfhost.mjs"]
