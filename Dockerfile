FROM node:12.16-buster-slim

COPY . /app
WORKDIR /app
RUN yarn && yarn build

CMD yarn start
