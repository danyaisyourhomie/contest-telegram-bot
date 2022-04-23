FROM node:14-alpine AS development

WORKDIR /partnadem/src/bot

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /partnadem/src/bot

COPY --from=development /partnadem/src/bot/ .

EXPOSE 8080

CMD [ "node", "dist/main" ]