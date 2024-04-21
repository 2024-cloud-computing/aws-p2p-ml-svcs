FROM node:alpine

RUN apk add build-base

WORKDIR /app
COPY . /app

RUN npm install

EXPOSE 2024

CMD ["npm", "start"]
