FROM node:20.18-alpine3.21 AS development

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install

EXPOSE 3001

CMD ["pnpm", "start:dev", "auth"]

FROM node:20.18-alpine3.21 AS production

WORKDIR /app

RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm build auth

EXPOSE 3001

CMD ["pnpm", "start:prod"]