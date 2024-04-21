FROM node:alpine

RUN apk --no-cache add --virtual builds-deps build-base python3
RUN apk add --no-cache nodejs npm

WORKDIR /app
COPY . /app

RUN npm install

EXPOSE 2024

CMD ["npm", "start"]