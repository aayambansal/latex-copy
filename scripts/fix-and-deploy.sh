#!/bin/bash
# Fix 502 Bad Gateway and deploy updated InkVell
set -e

echo "=========================================="
echo "🔧 Fixing 502 Bad Gateway and Deploying"
echo "=========================================="

cd ~/inkvell/overleaf || cd ~/latex-copy/overleaf || { echo "Project directory not found!"; exit 1; }

echo "📥 Pulling latest code..."
git pull origin main

echo "🛑 Stopping all containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

echo "🧹 Cleaning up..."
docker compose down -v 2>/dev/null || true

echo "🐳 Starting services with updated code..."
docker compose up -d

echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo "📊 Checking service status..."
docker compose ps

echo "🔍 Checking if backend is responding..."
sleep 10
docker compose logs inkvell --tail=50

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📋 Service Status:"
docker compose ps
echo ""
echo "🌐 Test your site:"
echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
echo ""
echo "📝 If still getting 502, check logs:"
echo "   docker compose logs -f inkvell"
echo ""

