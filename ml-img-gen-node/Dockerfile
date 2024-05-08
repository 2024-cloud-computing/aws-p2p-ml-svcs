FROM node:alpine

RUN apk add build-base

WORKDIR /app

COPY package.json .
RUN npm install

# sample_output_image is mockdata in case the request is failed
COPY index.js imageGeneration.js sample_output_image.png config.json /app/

EXPOSE 2030

CMD ["npm", "start"]