FROM node:20-alpine

ENV NITRO_PRESET=node
ENV HOST=0.0.0.0

WORKDIR /app

COPY package*.json ./
RUN npm install --ignore-scripts && npm rebuild sharp

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
