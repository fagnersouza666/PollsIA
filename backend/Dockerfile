# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy tsconfig.json
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check using curl (included in node:alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]