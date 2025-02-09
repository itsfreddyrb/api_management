# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install pnpm manually
RUN npm install -g pnpm

# Configure pnpm to use the correct store inside the container
RUN pnpm config set store-dir /app/.pnpm-store

# Copy only package.json and lock file first (for caching)
COPY package.json pnpm-lock.yaml tsconfig.json ./

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code AFTER installing dependencies
COPY . .

# Force TypeScript to recognize dependencies
RUN pnpm rebuild

# Fix missing types for TypeORM and NestJS Config
RUN pnpm add @nestjs/typeorm typeorm mysql2 dotenv @nestjs/config --save-dev

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["pnpm", "start"]