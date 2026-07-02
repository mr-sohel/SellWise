FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (ignoring scripts to avoid pre/post build hooks)
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

# Build shared package
RUN npm run build --workspace=@sellwise/shared

# Build server package
RUN npm run build --workspace=@sellwise/server

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install only production dependencies
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/migrations ./packages/server/migrations

ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace=@sellwise/server"]