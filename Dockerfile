# Use official Node.js LTS base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies: LibreOffice, Poppler, Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    wget \
    curl \
    fonts-dejavu \
    ca-certificates \
    gnupg \
    --no-install-recommends && \
    apt-get install -y \
    chromium \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libxss1 \
    xdg-utils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Tell Puppeteer where Chromium is
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy app source
COPY . .

# Expose app port (should match your app: process.env.PORT || 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
