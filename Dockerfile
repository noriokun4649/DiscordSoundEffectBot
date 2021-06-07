FROM node:current-alpine3.13

WORKDIR /var/docker/soundeffect-bot

COPY ./src .

RUN apk update && \
    apk upgrade && \
    apk --no-cache --virtual add git python3 make g++ && \
    apk del

RUN npm install

VOLUME  /var/docker/soundeffect-bot/files
VOLUME  /var/docker/soundeffect-bot/config

ENTRYPOINT [ "npm", "start" ]