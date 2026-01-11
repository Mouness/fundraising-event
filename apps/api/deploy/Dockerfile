FROM node:25-alpine AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api db:generate
RUN pnpm build
# Create a pruned lockfile and node_modules for production
RUN pnpm deploy --filter=api --prod --legacy /app/pruned

# Ensure Prisma Client is available in the deployed artifacts
RUN prisma_path=$(find /app -name ".prisma" -type d -print -quit) && \
    mkdir -p /app/pruned/node_modules/.prisma && \
    cp -r "$prisma_path/"* /app/pruned/node_modules/.prisma/

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the deployed application
COPY --from=builder /app/pruned .

# Copy the compiled output
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main"]
