# 1. Base Image
FROM node:20-alpine AS base

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Production Runner Stage
FROM base AS runner
WORKDIR /app


ENV NODE_ENV production

RUN addgroup --system --gid 1001 express
RUN adduser --system --uid 1001 expressjs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER expressjs

EXPOSE 5000
ENV PORT 5000

CMD ["node", "src/index.js"]

