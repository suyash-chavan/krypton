FROM node:12
WORKDIR /krypton
COPY package.json /krypton
RUN npm install
COPY . /krypton
CMD node server.js