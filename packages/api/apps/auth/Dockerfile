FROM node:20.18-alpine3.21 AS development

WORKDIR /app


# Add netcat for the wait-for script
RUN apk add --no-cache netcat-openbsd
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

RUN npm install -g pnpm
RUN pnpm install

COPY . .

EXPOSE 3001

CMD ["pnpm", "run", "start:dev", "auth"]

FROM node:20.18-alpine3.21 AS production

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --prod

COPY . .

RUN pnpm run build auth

EXPOSE 3001

CMD ["pnpm", "start:prod"]