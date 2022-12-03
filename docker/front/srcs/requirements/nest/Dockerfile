FROM node:19

WORKDIR /server
COPY server .

EXPOSE 3001

CMD rm -rf dist \
  && npm install @types/jest@27.0.1 --save-dev \
	&& npm install \
  && npm run start:dev
