FROM node:18.12.1

ENV NODE_VERSION 18.12.1

WORKDIR /app

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]

COPY . .

RUN npm install

CMD ["node", "deploy-commands.js"]

CMD [ "node", "server.js" ]