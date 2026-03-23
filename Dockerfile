FROM node:20-alpine

# Use libc6-compat since some Node.js libraries need it
RUN apk add --no-cache libc6-compat bash git

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]
