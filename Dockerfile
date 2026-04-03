# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# PocketBase is proxied through Next.js rewrites at /pb
ENV POCKETBASE_INTERNAL_URL=http://pocketbase:8090
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Run (standalone output for smaller image)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
