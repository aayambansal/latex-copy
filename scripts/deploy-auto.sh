#!/bin/bash
# Complete InkVell Deployment Script for DigitalOcean
# Run this script on your droplet

set -e

echo "=========================================="
echo "🚀 InkVell Deployment Script"
echo "=========================================="
echo ""

# Update system (non-interactive)
echo "📦 Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confold"

# Install Docker
echo ""
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
else
    echo "Docker already installed"
fi

# Install Docker Compose plugin
echo ""
echo "📦 Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# Clone repository
echo ""
echo "📥 Cloning InkVell repository..."
if [ -d "inkvell" ]; then
    echo "Repository already exists, updating..."
    cd inkvell
    git pull
else
    git clone https://github.com/aayambansal/latex-copy.git inkvell
    cd inkvell
fi

# Create production docker-compose file
echo ""
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
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health_check"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s

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
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  inkvell-data:
  mongo-data:
  redis-data:
EOF

# Copy logo if it exists
if [ -f "logo.png" ]; then
    echo "✅ Logo file found"
else
    echo "⚠️  Logo file not found, but continuing..."
fi

# Stop any existing containers
echo ""
echo "🛑 Stopping any existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start services
echo ""
echo "🚀 Starting InkVell services..."
echo "This will download ~2GB of Docker images (first time only)..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services
echo ""
echo "⏳ Waiting for services to initialize..."
echo "This may take 2-3 minutes on first run..."
sleep 30

# Check MongoDB replica set initialization
echo ""
echo "🔧 Initializing MongoDB replica set..."
docker compose -f docker-compose.prod.yml up mongoinit 2>/dev/null || true

# Wait a bit more
sleep 30

# Check status
echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Access InkVell at: http://64.23.188.40"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop:          docker compose -f docker-compose.prod.yml down"
echo "   Restart:       docker compose -f docker-compose.prod.yml restart"
echo "   Status:        docker compose -f docker-compose.prod.yml ps"
echo ""
echo "⏳ Services are still starting up. Wait 1-2 minutes, then refresh http://64.23.188.40"
echo ""


