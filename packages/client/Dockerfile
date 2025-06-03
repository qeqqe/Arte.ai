# Development stage
FROM node:20-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (allow lockfile updates in development)
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 3000

# Use pnpm to run the dev command
CMD ["pnpm", "run", "dev"]

# Production build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source and build
COPY . .
RUN pnpm run build

# Production runtime stage
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy built application from builder stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV NODE_ENV=production
# Use the standalone server
CMD ["node", "server.js"]