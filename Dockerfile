FROM node:20.16.0-alpine3.20

# Update APK
RUN apk update

# Install PM2
RUN npm install pm2 -g

# Update package lists and install necessary packages
RUN apk add bash vim

# Set the working directory
WORKDIR /usr/app/

# Copy and install dependencies
COPY ./package.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application
COPY ./ ./

# Create a directory for logs
RUN mkdir -p ./logs