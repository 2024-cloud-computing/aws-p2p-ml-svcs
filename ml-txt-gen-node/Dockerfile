FROM node:alpine

RUN apk add build-base

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js /app/

EXPOSE 2026

CMD ["npm", "start"]
