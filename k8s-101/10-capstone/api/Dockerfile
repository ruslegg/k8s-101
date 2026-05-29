# ---- deps stage: install production dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only manifests first so npm install can be cached
COPY package.json ./
# If you add package-lock.json later, copy it here too and use `npm ci`.
RUN npm install --omit=dev --no-audit --no-fund

# ---- runtime stage: tiny final image ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Don't run as root. Node's official image ships a "node" user.
ENV NODE_ENV=production
USER node

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

EXPOSE 8080

# Use the array form so the process receives SIGTERM directly
# (no shell wrapper to swallow it).
CMD ["node", "src/server.js"]
