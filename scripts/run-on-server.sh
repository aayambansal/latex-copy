#!/bin/bash
# Copy and paste this entire script into your DigitalOcean console

cd ~/latex-copy && docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm -f $(docker ps -aq) 2>/dev/null || true
systemctl restart docker
sleep 5
docker volume prune -f
cd ~/latex-copy && cat > docker-compose.prod.yml << 'EOF'
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
    image: mongo:8.0
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
docker compose -f docker-compose.prod.yml up -d
echo "Waiting 2 minutes for services to start..."
sleep 120
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml run --rm mongoinit
echo "✅ Done! Access at http://137.184.36.62"

