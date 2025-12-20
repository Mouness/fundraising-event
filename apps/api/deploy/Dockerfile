FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
# We need to copy the whole monorepo context to build properly with workspaces
COPY . .
# Install dependencies (using pnpm)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
