# =========================================================
# JARVIS AUTONOMOUS AI PLATFORM - PRODUCTION DOCKERFILE
# Multi-Stage Optimized Container Architecture
# =========================================================

# Stage 1: Build Frontend Assets and Bundle Node Server
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source
COPY . .

# Compile Frontend SPA and bundle Server into dist/server.cjs
RUN npm run build

# Stage 2: Production Minimal Runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled bundles and assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env.example

# Add non-root system user for enterprise security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S jarvis -u 1001 && \
    chown -R jarvis:nodejs /app

USER jarvis

EXPOSE 3000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Launch bundled CommonJS server
CMD ["node", "dist/server.cjs"]
