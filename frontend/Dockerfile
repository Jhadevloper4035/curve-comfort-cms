

# ── Development ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY src ./src
COPY index.html tsconfig*.json vite.config.js ./

EXPOSE 5173

ENV NODE_ENV=development

CMD ["npm", "run", "dev"]


# ── Builder ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Outputs to /app/dist
RUN npm run build


# ── Production ─────────────────────────────────────────────────────────────────
# nginxinc/nginx-unprivileged: official hardened image, runs as uid 101 (non-root),
# tracks security patches faster than the Docker Hub nginx image.
# Unprivileged nginx listens on port 8080 instead of 80.


FROM nginxinc/nginx-unprivileged:alpine AS production

USER root
RUN apk update && apk upgrade --no-cache
USER 101

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
