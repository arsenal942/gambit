# ── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root manifests
COPY package.json package-lock.json ./

# Copy ALL workspace package.json files (npm workspaces requires all entries)
COPY packages/engine/package.json ./packages/engine/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install all dependencies
RUN npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY packages/engine/ ./packages/engine/
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

# Build in dependency order
RUN npm run build -w packages/engine && \
    npm run build -w packages/shared && \
    npm run build -w apps/server

# ── Production stage ─────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY packages/engine/package.json ./packages/engine/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built outputs from builder
COPY --from=builder /app/packages/engine/dist/ ./packages/engine/dist/
COPY --from=builder /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=builder /app/apps/server/dist/ ./apps/server/dist/

EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
