# ---- BUILD STAGE ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies for building
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ---- RUNTIME STAGE ----
FROM node:20-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production && yarn cache clean

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
CMD ["node", "dist/main.js"]
