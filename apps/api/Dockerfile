FROM node:20-alpine AS base

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build step if needed, or expose dev runner
EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "dev"]
