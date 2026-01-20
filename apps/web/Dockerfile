# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time argument for API URL (required for Vite)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY entrypoint.sh ./

RUN chmod +x entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["./entrypoint.sh"]
