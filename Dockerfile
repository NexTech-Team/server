# Use the official Node.js image as a base
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run migrations and seeders
RUN npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all

# Expose the port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]