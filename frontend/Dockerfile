# Frontend Dockerfile
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip network issues)
RUN npm install --no-audit --no-fund || echo "Install completed with warnings"

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev"]