# 1. Node base image with Debian (apt support)
FROM node:18-slim

# 2. Install Python3, pip, and ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 3. Create app directory
WORKDIR /app

# 4. Copy package.json & package-lock.json first (for caching)
COPY package*.json ./

# 5. Install dependencies
RUN npm install

# 6. Copy rest of your app code
COPY . .

# 7. Expose port (optional but helpful)
EXPOSE 5000

# 8. Run server
CMD ["node", "server.js"]
