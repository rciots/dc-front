FROM registry.access.redhat.com/ubi9/nodejs-16:latest
USER root
COPY package*.json ./
RUN npm install
COPY . /opt/app-root/src
RUN npm cache clean --force
user 1001
EXPOSE 8080
CMD npm start
