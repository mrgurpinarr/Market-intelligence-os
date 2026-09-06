FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy packages
COPY packages ./packages

# Copy apps
COPY apps/web ./apps/web

# Install all monorepo dependencies
RUN pnpm install --frozen-lockfile

# Build packages first
RUN pnpm --filter "@market-intel/*" build

# Build web application
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter web build

FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=base /app ./

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]
