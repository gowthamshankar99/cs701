FROM node:6

MAINTAINER gowthamshankar

WORKDIR /usr/dir

COPY package.json package.json

RUN npm install

COPY . .

EXPOSE 8005

CMD ["node", "server.js"]