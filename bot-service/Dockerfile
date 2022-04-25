#
# ---- Base Node ----

FROM node:13-alpine AS base

RUN apk add --no-cache tini

WORKDIR  /partnadem/src/bot
COPY package.json .
COPY package-lock.json .

#
# ---- Dependencies ----
FROM base AS dependencies

RUN npm ci --only=production

# ---- Build ----
FROM dependencies AS build
COPY . .


#
# ---- Release ----
FROM build AS release
EXPOSE 3000
CMD ["tini","npm", "run", "start"]