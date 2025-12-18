#!/bin/bash
# InkVell DigitalOcean Deployment Script
# Run this on a fresh Ubuntu 22.04 droplet

set -e

echo "🚀 Installing InkVell on DigitalOcean..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo apt-get install -y docker-compose-plugin

# Clone the repository
echo "📥 Cloning InkVell..."
cd ~
git clone https://github.com/aayambansal/latex-copy.git inkvell
cd inkvell

# Create docker-compose for production
echo "📝 Creating production configuration..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  inkvell:
    image: sharelatex/sharelatex:latest
    container_name: inkvell
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "80:80"
      - "443:443"
    environment:
      OVERLEAF_APP_NAME: InkVell
      OVERLEAF_MONGO_URL: mongodb://mongo/inkvell
      OVERLEAF_REDIS_HOST: redis
      OVERLEAF_REDIS_PORT: 6379
      OVERLEAF_ALLOW_PUBLIC_ACCESS: "true"
      EMAIL_CONFIRMATION_DISABLED: "true"
      ENABLED_LINKED_FILE_TYPES: "project_file,project_output_file"
      ENABLE_CONVERSIONS: "true"
    volumes:
      - inkvell-data:/var/lib/overleaf
      - ./logo.png:/overleaf/services/web/public/img/brand/inkvell-logo.png:ro
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    container_name: inkvell-mongo
    command: --replSet rs0
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 10s
      retries: 5
      start_period: 40s
    restart: unless-stopped

  mongoinit:
    image: mongo:5.0
    container_name: inkvell-mongoinit
    depends_on:
      mongo:
        condition: service_healthy
    command: >
      mongosh mongo:27017 --eval "
        try {
          rs.status();
          print('Replica set already initialized');
        } catch (e) {
          rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongo:27017' }] });
          print('Replica set initialized');
        }
      "
    restart: "no"

  redis:
    image: redis:6.2-alpine
    container_name: inkvell-redis
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  inkvell-data:
  mongo-data:
  redis-data:
EOF

# Start services
echo "🚀 Starting InkVell..."
sudo docker compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to initialize (this may take 2-3 minutes)..."
sleep 60

# Check status
echo "✅ Checking service status..."
sudo docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "🎉 InkVell is now running!"
echo "=========================================="
echo ""
echo "Access your InkVell instance at:"
echo "  http://$(curl -s ifconfig.me)"
echo ""
echo "Useful commands:"
echo "  View logs:     sudo docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:          sudo docker compose -f docker-compose.prod.yml down"
echo "  Restart:       sudo docker compose -f docker-compose.prod.yml restart"
echo ""

