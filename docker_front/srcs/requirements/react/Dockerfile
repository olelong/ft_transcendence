FROM node:19

WORKDIR /app
COPY app/package*.json ./

EXPOSE 3000

CMD npm install \
  && chown -R node:node /app \
  && npm start
