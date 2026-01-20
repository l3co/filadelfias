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

# Production stage with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# nginx runs as PID 1
CMD ["nginx", "-g", "daemon off;"]
