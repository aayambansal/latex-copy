#!/bin/bash
# Pull latest code and restart services on DigitalOcean
set -e

echo "=========================================="
echo "🔄 Updating and Restarting InkVell"
echo "=========================================="

cd ~/inkvell/overleaf || { echo "❌ Project directory not found!"; exit 1; }

echo "📥 Pulling latest code..."
git pull origin main

echo "🛑 Stopping services..."
docker compose down

echo "🚀 Starting services with updated code..."
docker compose up -d

echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo "📊 Checking service status..."
docker compose ps

echo ""
echo "=========================================="
echo "✅ Update Complete!"
echo "=========================================="
echo ""
echo "📝 View logs: docker compose logs -f inkvell"
echo ""

