#!/bin/bash
# Quick deployment commands for DigitalOcean
# Run these on your DigitalOcean droplet

echo "=========================================="
echo "🚀 Deploying InkVell to pancakes.inkvell.ai"
echo "=========================================="

# 1. Update docker-compose.prod.yml with correct URLs
cat > docker-compose.prod.yml << 'EOF'
services:
  inkvell:
    image: sharelatex/sharelatex:latest
    platform: linux/amd64
    container_name: inkvell
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_started
    ports:
      - "127.0.0.1:80:80"
    environment:
      OVERLEAF_APP_NAME: InkVell
      OVERLEAF_MONGO_URL: mongodb://mongo/inkvell
      OVERLEAF_REDIS_HOST: redis
      OVERLEAF_REDIS_PORT: 6379
      OVERLEAF_ALLOW_PUBLIC_ACCESS: "false"
      EMAIL_CONFIRMATION_DISABLED: "true"
      ENABLED_LINKED_FILE_TYPES: "project_file,project_output_file"
      ENABLE_CONVERSIONS: "true"
      OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
      SUPABASE_URL: https://ikbtchgrensgpvzthwqp.supabase.co
      SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRjaGdyZW5zZ3B2enRod3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjYwNTkxNywiZXhwIjoyMDgyMTgxOTE3fQ.HsXH0UCoxUGCqoX7WtSH2ai5gWIx-5kHOX1E5XZfwpY
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-YOUR_GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-YOUR_GOOGLE_CLIENT_SECRET}
      GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback
    volumes:
      - inkvell-data:/var/lib/overleaf
      - ./logo.png:/overleaf/services/web/public/img/brand/inkvell-logo.png:ro
    restart: unless-stopped

  mongo:
    image: mongo:8.0
    platform: linux/amd64
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
    image: mongo:8.0
    platform: linux/amd64
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

# 2. Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# 3. Create Nginx config
echo "📝 Creating Nginx configuration..."
cat > /etc/nginx/sites-available/pancakes.inkvell.ai << 'NGINX_EOF'
server {
    listen 80;
    server_name pancakes.inkvell.ai;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
NGINX_EOF

# 4. Enable site
ln -sf /etc/nginx/sites-available/pancakes.inkvell.ai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# 5. Test and reload Nginx
nginx -t && systemctl reload nginx

# 6. Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    apt-get install -y certbot python3-certbot-nginx
fi

# 7. Start Docker services
echo "🐳 Starting Docker services..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 8. Wait for services
echo "⏳ Waiting for services to start..."
sleep 60

# 9. Initialize MongoDB
docker compose -f docker-compose.prod.yml run --rm mongoinit

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo "1. Add DNS A record: pancakes.inkvell.ai → $(curl -s ifconfig.me)"
echo "2. Wait for DNS propagation (5-60 min)"
echo "3. Run SSL setup: sudo certbot --nginx -d pancakes.inkvell.ai"
echo "4. Add OAuth redirect: https://pancakes.inkvell.ai/auth/google/callback"
echo ""
echo "🌐 Test: http://pancakes.inkvell.ai/login"
echo ""

