FROM node:alpine

RUN apk add build-base

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js /app/

EXPOSE 2025 8080

CMD ["npm", "start"]
