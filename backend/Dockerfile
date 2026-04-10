# ---- Backend Dockerfile ----
FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/maintenance

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]
