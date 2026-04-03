# Stage 1: Build Next.js
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV POCKETBASE_INTERNAL_URL=http://localhost:8090
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 2: Run everything in one container
FROM node:20-alpine

RUN apk add --no-cache ca-certificates wget unzip supervisor

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV POCKETBASE_INTERNAL_URL=http://localhost:8090

# Download PocketBase
ARG PB_VERSION=0.25.9
RUN wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O /tmp/pb.zip \
    && unzip /tmp/pb.zip -d /usr/local/bin/ \
    && rm /tmp/pb.zip \
    && chmod +x /usr/local/bin/pocketbase

# Copy Next.js standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy seed data (migrations already applied in seed DB, skip migration files)
COPY --from=builder /app/pocketbase/pb_data /pb/pb_data_seed

# Supervisor config to run both processes
RUN mkdir -p /var/log/supervisor
COPY <<'SUPERVISORCONF' /etc/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log

[program:pocketbase]
command=/usr/local/bin/pocketbase serve --http=0.0.0.0:8090 --dir=/pb/pb_data --automigrate=false
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nextjs]
command=node /app/server.js
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
SUPERVISORCONF

# PocketBase data volume
VOLUME /pb/pb_data

COPY --from=builder /app/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

CMD ["/entrypoint.sh"]
