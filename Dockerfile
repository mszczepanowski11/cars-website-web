FROM node:20

ENV NITRO_PRESET=node
ENV HOST=0.0.0.0

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
