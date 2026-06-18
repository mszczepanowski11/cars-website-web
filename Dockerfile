FROM node:20

ENV NITRO_PRESET=node
ENV HOST=0.0.0.0

WORKDIR /app

COPY package*.json ./
RUN npm pkg delete scripts.postinstall && npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
