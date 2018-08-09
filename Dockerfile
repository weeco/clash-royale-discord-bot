FROM mhart/alpine-node:latest

WORKDIR /app

COPY . /app

RUN apk add --no-cache git && \
    npm install --unsafe-perm && \
    apk del git

COPY . .
CMD [ "npm", "start" ]
