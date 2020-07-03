FROM node:12.16-buster-slim

COPY . /app
# Copy the production ormconfig into the main directory
COPY deploy/ormconfig.json /app/ormconfig.json
WORKDIR /app
RUN yarn && yarn build

CMD yarn start
