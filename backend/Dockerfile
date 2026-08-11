

# Development
FROM node:22-alpine AS development
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY src ./src
COPY seed.js ./
EXPOSE 8000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]




# Production deps
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Production
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY seed.js ./
COPY package.json ./
EXPOSE 8000
ENV NODE_ENV=production
CMD ["src/server.js"]
