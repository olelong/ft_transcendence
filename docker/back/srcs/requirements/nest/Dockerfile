FROM node:19

WORKDIR /server
COPY server .

EXPOSE 3001

CMD rm -rf dist \
	&& npm install \
  && npx prisma migrate dev --name init \
  && npm run start:dev
