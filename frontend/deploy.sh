#!/bin/bash
# Deploy script for Oracle Cloud (or any Docker host)

set -e

echo "🚀 Deploying TheSalonHub Frontend..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t thesalonhub-frontend .

# Stop and remove old container if exists
echo "🛑 Stopping old container..."
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# Run new container
echo "▶️ Starting new container..."
docker run -d \
  --name frontend \
  -p 8080:8080 \
  --env-file .env.production \
  --restart unless-stopped \
  thesalonhub-frontend

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
echo "📊 Container status:"
docker ps | grep frontend

echo ""
echo "📝 View logs with: docker logs -f frontend"
