FROM registry.access.redhat.com/ubi9/nodejs-16:latest
USER root
RUN chown -R 1001:0 /app
COPY package*.json ./
RUN npm install -g npm@9.1.1
RUN npm install
COPY . /opt/app-root/src
RUN npm cache clean --force
USER 1001
EXPOSE 8080
CMD npm start
