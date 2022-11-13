FROM registry.access.redhat.com/ubi9/nodejs-16:latest
USER root

COPY package*.json ./
RUN npm install -g npm@9.1.1
RUN npm install
COPY . /opt/app-root/src
RUN npm cache clean --force
RUN chown -R 1000680000:0 /opt/app-root/src
USER 1000680000
EXPOSE 8080
CMD npm start
