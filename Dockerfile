# Use a Node.js base image
FROM node:18

# Set the working directory to the backend folder
WORKDIR /app/backend

# Copy only the package.json and package-lock.json files for dependencies
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the backend folder's code to the working directory
COPY backend/ .

# Expose the port your backend server runs on (e.g., 3000)
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"]
