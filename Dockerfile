FROM node:18

WORKDIR /usr/app

# install app dependencies
COPY package*.json /usr/app/
RUN npm install

# bundle app source
COPY . /usr/app/

CMD [ "npm", "start" ]