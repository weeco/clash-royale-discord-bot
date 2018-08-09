FROM mhart/alpine-node:latest

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN apk add --no-cache git && \
    npm install && \
    apk del git

COPY . .
CMD [ "npm", "start" ]
