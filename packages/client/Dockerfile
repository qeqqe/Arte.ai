# Development stage
FROM node:20-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
# Use --shamefully-hoist to ensure binaries are properly linked
RUN pnpm install --shamefully-hoist

COPY . .

EXPOSE 3000

# Use npx to ensure the next command is found
CMD ["npx", "next", "dev"]

# Production build stage.
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --shamefully-hoist

COPY . .
RUN pnpm build

# Production runtime stage.
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy only necessary files for production.
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV NODE_ENV=production
# Use the standalone server to run the application.
CMD ["node", "server.js"]