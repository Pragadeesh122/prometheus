FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN yarn

COPY . .

 RUN  yarn add global typescript && yarn tsc -b

# Bundle app source

EXPOSE 3000
CMD [ "node", "dist/index.js" ]