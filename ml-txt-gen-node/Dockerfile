FROM node:alpine

RUN apk add build-base

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js config.json /app/

EXPOSE 2024

CMD ["npm", "start"]
