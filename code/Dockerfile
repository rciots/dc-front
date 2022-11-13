FROM registry.access.redhat.com/ubi9/nodejs-16:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN dnf upgrade -y
RUN dnf clean all
RUN npm cache clean --force
EXPOSE 8080
CMD npm start
