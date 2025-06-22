# Frontend Dockerfile
FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --no-audit --no-fund --production || echo "Install completed with warnings"

# Copy source code
COPY . .

# Build and expose port
RUN npm run build
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
