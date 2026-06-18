FROM node:20

ENV NITRO_PRESET=node
ENV HOST=0.0.0.0

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build && ls -la .output/server/ && head -80 .output/server/index.mjs

EXPOSE 3000

CMD ["sh", "-c", "echo 'PORT='$PORT && echo 'HOST='$HOST && node .output/server/index.mjs 2>&1"]
