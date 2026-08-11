# CTO audit finding (MEDIUM): the previous single-stage Dockerfile did `COPY . .` with no
# .dockerignore in either repo, and shipped the entire npm toolchain + build-time devDependencies
# into the final runtime image instead of just the built output. That's a slower/larger build and
# real risk of a stray local .env or .git history ending up inside the image. Nitro's own
# postbuild step (scripts/postbuild-sharp.mjs) already copies every native binary the server needs
# (sharp + its libvips shared libraries) INTO .output/server/node_modules itself, so the runtime
# stage genuinely only needs .output/ - nothing from node_modules has to be copied separately.
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build && ls -la .output/server/ && head -80 .output/server/index.mjs

FROM node:20-slim AS runtime
ENV NITRO_PRESET=node_server
ENV HOST=0.0.0.0
WORKDIR /app
COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["sh", "-c", "echo 'PORT='$PORT && echo 'HOST='$HOST && node .output/server/index.mjs 2>&1"]
