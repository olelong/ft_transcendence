FROM node:19

WORKDIR /server

COPY package*.json ./
RUN npm install

COPY . ./

EXPOSE 3001

CMD npx prisma db push \
  && npm start
#CMD npx prisma migrate deploy \
#  && npx prisma generate \
#  && npm start
