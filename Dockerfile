# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# No NEXT_PUBLIC_POCKETBASE_URL needed in production
# PocketBase is proxied through Next.js rewrites at /pb
ENV POCKETBASE_INTERNAL_URL=http://pocketbase:8090

RUN npm run build

# Stage 2: Run
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV POCKETBASE_INTERNAL_URL=http://pocketbase:8090

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

EXPOSE 3000

CMD ["npm", "start"]
