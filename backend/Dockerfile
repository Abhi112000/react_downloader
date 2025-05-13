# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Install latest yt-dlp manually
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

# Force youtube-dl-exec to use system yt-dlp
ENV YOUTUBE_DL_PATH=/usr/local/bin/yt-dlp

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD [ "node", "server.js" ]
