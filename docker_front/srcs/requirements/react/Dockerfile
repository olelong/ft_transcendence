FROM node:19

WORKDIR /app
COPY app/package*.json ./

RUN npm install \
  && chown -R node:node /app

EXPOSE 3000

CMD npm start
