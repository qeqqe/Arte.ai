FROM node:20.18-alpine3.21 AS development

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

RUN  npm install -g pnpm 
RUN pnpm install

COPY . .

EXPOSE 3004

CMD ["pnpm", "run", "start:dev", "nlp-service"]

FROM node:20.18-alpine3.21 AS production

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --prod

COPY . .

RUN pnpm run build nlp-service

EXPOSE 3004

CMD ["pnpm", "start:prod"]