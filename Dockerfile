# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g typescript

# Copy the rest of the application
COPY . .

# Build TypeScript code
RUN npx tsc -b

# Expose the port your app is running on
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
