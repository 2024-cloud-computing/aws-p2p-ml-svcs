FROM node:alpine

RUN apk add build-base

WORKDIR /app

COPY package.json .
RUN npm install

COPY index.js imageGeneration.js config.json /app/

EXPOSE 2030

CMD ["npm", "start"]