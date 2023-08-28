#Docker build script for the express app.
#for production:
#1. use specific slim node version image (deterministic environment, low space footprint)
#2. set NODE_ENV=production
#3. run as low priviledged user instead of root
#4. run security scan when building image
#5. multi-step build: image that transpile TS into JS and runs unit tests -> build final image off prev image with min depend. 
#6. utilize dockers secrets mounting
FROM node as dev
WORKDIR /usr/src/task_manager
COPY package*.json .
RUN npm install
COPY certificate.pem etc/ssl/certs/
COPY key.pem etc/ssl/certs/
ENV PORT 3000
ENV NODE_ENV dev
EXPOSE $PORT
CMD [ "npm", "run", "dev-start"]


FROM dev as prod
WORKDIR /task_manager
COPY package*.json .
RUN npm install --omit=dev
COPY ./ src/
RUN cd src/
ENV NODE_ENV prod
EXPOSE $PORT
CMD [ "npm", "run", "prod-start" ]
