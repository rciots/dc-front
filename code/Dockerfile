FROM registry.access.redhat.com/ubi9/nodejs-16:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app
RUN dnf upgrade -y
RUN dnf clean all
RUN npm cache clean --force
EXPOSE 8080
CMD npm start
