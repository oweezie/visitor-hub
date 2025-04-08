# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./
# If using yarn, uncomment the following line
# COPY yarn.lock ./

# Install dependencies
RUN npm ci
# If using yarn, uncomment the following line and comment the above
# RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build
# If using yarn, uncomment the following line and comment the above
# RUN yarn build

# Production stage
FROM nginx:alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed for SPA routing
# This creates a simple configuration to handle client-side routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]