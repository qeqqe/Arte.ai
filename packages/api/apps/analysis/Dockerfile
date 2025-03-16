FROM node:20.18-alpine3.21 AS development

WORKDIR /app

# Add netcat for the wait-for script
RUN apk add --no-cache netcat-openbsd

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

# Install dependencies without frozen lockfile to avoid errors when package.json and lockfile mismatch
RUN pnpm install --no-frozen-lockfile && pnpm store prune

# Copy the rest of the application
COPY . .

# Clean any potential build artifacts
RUN pnpm run clean || echo "No clean script found"

EXPOSE 3003

CMD ["pnpm", "run", "start:dev", "analysis"]

FROM node:20.18-alpine3.21 AS build

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies without frozen lockfile
RUN pnpm install --no-frozen-lockfile && pnpm store prune

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm run build analysis

FROM node:20.18-alpine3.21 AS production

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile && pnpm store prune

# Copy built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3003

CMD ["node", "dist/apps/analysis/main"]