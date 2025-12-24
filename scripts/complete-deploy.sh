#!/bin/bash
# Complete InkVell Deployment - Run Everything
set -e

echo "=========================================="
echo "🚀 Complete InkVell Deployment"
echo "=========================================="

# Fix DNS
echo "🔧 Fixing DNS..."
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Update system
echo "📦 Updating system..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confold" 2>/dev/null || true

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
else
    echo "Docker already installed"
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# Clone repository
echo "📥 Cloning InkVell..."
cd ~
if [ -d "latex-copy" ]; then
    rm -rf latex-copy
fi
git clone https://github.com/aayambansal/latex-copy.git
cd latex-copy

# Create docker-compose file
echo "📝 Creating configuration..."
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
echo "🚀 Starting InkVell (downloading ~2GB, please wait)..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d

# Wait and initialize
echo "⏳ Waiting for services to start..."
sleep 60
docker compose -f docker-compose.prod.yml up mongoinit 2>/dev/null || true
sleep 30

# Status
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Access InkVell at: http://64.23.188.40"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""
echo "⏳ Wait 1-2 minutes, then refresh http://64.23.188.40"
echo ""


