# Frontend Dockerfile with multi-stage build
# Stage 1: Build the React app
# Stage 2: Serve with nginx

# ============================================
# STAGE 1: Builder
# ============================================
# This stage has all the tools needed to build the app
# It will be DISCARDED after we extract the built files

FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for layer caching)
# If package.json/package-lock.json don't change, npm install is cached
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# We need TypeScript, Vite, etc. to build the app
RUN npm install

# Copy source code
# This comes after npm install so code changes don't invalidate node_modules
COPY . .

# Accept build arguments
ARG VITE_API_URL
# Make it available to the build proces
ENV VITE_API_URL=${VITE_API_URL}

# Build the production bundle
# This runs TypeScript compiler, Vite bundler, creates optimized files
# Output goes to /app/dist/
RUN npm run build

# At this point we have:
# - node_modules/ (400 MB) ❌ Don't need in production
# - src/ (TypeScript source) ❌ Don't need in production
# - dist/ (compiled HTML/CSS/JS) ✅ THIS is what we need!

# ============================================
# STAGE 2: Production
# ============================================
# Fresh start! None of the build tools from Stage 1 are here
# We start with a tiny nginx image and only copy the built files

FROM nginx:alpine

# Copy built files from Stage 1 to nginx's serving directory
# --from=builder: Reference the 'builder' stage above
# /app/dist: The built files from Stage 1
# /usr/share/nginx/html: Where nginx serves files from
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
# This tells nginx how to serve our SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (HTTP)
EXPOSE 80

# nginx starts automatically with this base image
# No CMD needed - the nginx:alpine image has it configured
