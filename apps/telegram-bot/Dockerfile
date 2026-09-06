FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages
COPY packages ./packages

# Copy telegram-bot app
COPY apps/telegram-bot ./apps/telegram-bot

# Install all monorepo dependencies
RUN pnpm install --frozen-lockfile

# Build packages and bot
RUN pnpm --filter "@market-intel/*" build
RUN pnpm --filter telegram-bot build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=base /app ./

CMD ["node", "apps/telegram-bot/dist/index.js"]
