# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install pnpm manually
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml before running pnpm install
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the Next.js app
CMD ["pnpm", "dev"]