FROM node:argon

ENV user node
RUN groupadd -r node && useradd -r -g node node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .
RUN npm i --production
COPY . .

EXPOSE 3001
CMD [ "node", "server" ]
