# Dockerfile for petite-poste — the local Resend-compatible mock mailer.
# Builds inside a Node container so the only requirement on the host is Docker.

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

# Workspace manifests first (cache layer). pnpm needs every workspace package
# manifest present to resolve filters against the lockfile.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/gothic-garrison/package.json ./apps/gothic-garrison/package.json
COPY apps/petite-poste/package.json ./apps/petite-poste/package.json
COPY packages/db/package.json ./packages/db/package.json

# Install only what petite-poste needs. esbuild postinstall is already
# approved via allowBuilds in pnpm-workspace.yaml.
RUN pnpm install --filter petite-poste... --frozen-lockfile

# Source + build
COPY apps/petite-poste ./apps/petite-poste
RUN pnpm --filter petite-poste build

# Runtime: adapter-node emits a self-contained bundle, so no node_modules needed.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8025 HOST=0.0.0.0
COPY --from=build /repo/apps/petite-poste/build ./build
EXPOSE 8025
CMD ["node", "build"]
