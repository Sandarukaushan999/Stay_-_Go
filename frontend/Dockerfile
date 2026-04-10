# ---- Frontend Dockerfile ----
FROM node:20-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server (accessible from outside container)
CMD ["npx", "vite", "--host", "0.0.0.0"]
