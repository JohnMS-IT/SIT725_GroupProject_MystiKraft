# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port 3000 (internal to container)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
