#!/bin/bash

# User Management Service Startup Script

echo "🚀 Starting User Management Service..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please update .env with your configuration before running again."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "🔨 Building application..."
    npm run build
fi

# Start the service
echo "🌟 Starting User Management Service on port 3005..."
echo "📚 API Documentation: http://localhost:3005/api/docs"
echo "🔍 Health Check: http://localhost:3005/health"

npm start
