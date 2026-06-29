# Use Node.js Debian-based slim image
FROM node:20-slim

# Install Python 3, pip, and python-is-python3 link
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python-is-python3 \
    && rm -rf /var/lib/apt/lists/*

# Install required Python packages for the analytics engine
RUN pip3 install --no-cache-dir --break-system-packages pandas numpy scikit-learn

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy remaining backend source code
COPY . .

# Expose port (can be overridden by environment variable PORT)
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
