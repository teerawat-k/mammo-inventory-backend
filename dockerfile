FROM node:21-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . .

RUN npm i
RUN npm install -g sequelize-cli

CMD [ "node", "App.js" ]