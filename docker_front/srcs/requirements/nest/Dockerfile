FROM node:19

WORKDIR /server
COPY server .

RUN npm install @types/jest@27.0.1 \
	&& npm install

EXPOSE 3001

CMD rm -rf dist \
  && npm run start:dev
