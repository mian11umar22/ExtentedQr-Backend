# Use official Node.js LTS base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies: LibreOffice, Poppler, and required utilities
RUN apt-get update && apt-get install -y \
    libreoffice \
    poppler-utils \
    wget \
    curl \
    fonts-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the backend port (make sure it matches the port your app uses)
EXPOSE 3000

# Set environment variables (if using Railway's variables, they'll override at runtime)
ENV NODE_ENV=production

# Start the backend server
CMD ["npm", "start"]
