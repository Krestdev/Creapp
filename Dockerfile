FROM node:22-alpine AS base

# -------- Dependency Stage --------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# -------- Builder Stage --------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_PUBLIC_API=${NEXT_PUBLIC_API}

RUN npm run build

# -------- Runtime Stage --------
FROM base AS runtime
WORKDIR /app

COPY --from=builder  /app ./

EXPOSE 3000


CMD ["npm", "start"]