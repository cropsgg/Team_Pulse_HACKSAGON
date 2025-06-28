# Multi-stage build for optimized production image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables must be present at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WEB3_PROJECT_ID
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_ROUTER_ADDRESS
ARG NEXT_PUBLIC_NGO_REGISTRY_ADDRESS
ARG NEXT_PUBLIC_DONATION_MANAGER_ADDRESS
ARG NEXT_PUBLIC_MILESTONE_MANAGER_ADDRESS
ARG NEXT_PUBLIC_STARTUP_REGISTRY_ADDRESS
ARG NEXT_PUBLIC_EQUITY_ALLOCATOR_ADDRESS
ARG NEXT_PUBLIC_CSR_MANAGER_ADDRESS
ARG NEXT_PUBLIC_FEE_MANAGER_ADDRESS
ARG NEXT_PUBLIC_QA_MEMORY_ADDRESS
ARG NEXT_PUBLIC_IMPACT_TOKEN_ADDRESS
ARG NEXT_PUBLIC_IMPACT_TIMELOCK_ADDRESS
ARG NEXT_PUBLIC_IMPACT_GOVERNOR_ADDRESS

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"] 