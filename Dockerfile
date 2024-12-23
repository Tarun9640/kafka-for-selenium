# Use official Node.js image
FROM node:16

# Set working directory
WORKDIR /src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app is running on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
