# Domain Setup Guide: pancakes.inkvell.ai → DigitalOcean

## Prerequisites
- DigitalOcean droplet running (IP: 137.184.36.62)
- Domain: inkvell.ai (you own this)
- DNS access to manage inkvell.ai records

## Step 1: Configure DNS Records

### Option A: Using Subdomain (pancakes.inkvell.ai)

1. **Go to your domain registrar** (where you manage inkvell.ai)
2. **Add an A Record:**
   - **Type**: A
   - **Name/Host**: `pancakes` (or `pancakes.inkvell.ai` depending on your DNS provider)
   - **Value/IP**: `137.184.36.62`
   - **TTL**: 3600 (or default)

3. **Wait for DNS propagation** (5-60 minutes)

### Option B: Using Root Domain (inkvell.ai)

If you want to use the root domain instead:

1. **Add A Record:**
   - **Type**: A
   - **Name/Host**: `@` (or blank/root)
   - **Value/IP**: `137.184.36.62`
   - **TTL**: 3600

2. **Update docker-compose.yml** to use `inkvell.ai` instead of `pancakes.inkvell.ai`

## Step 2: Verify DNS Resolution

```bash
# Check if DNS is resolving
dig pancakes.inkvell.ai
# or
nslookup pancakes.inkvell.ai

# Should return: 137.184.36.62
```

## Step 3: Update Google OAuth Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `https://pancakes.inkvell.ai/auth/google/callback`
   - `http://localhost/auth/google/callback` (for local development)
5. Click **Save**

## Step 4: Configure Nginx on DigitalOcean

SSH into your DigitalOcean droplet:

```bash
ssh root@137.184.36.62
```

### Install Nginx

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/pancakes.inkvell.ai
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name pancakes.inkvell.ai;

    # Increase body size for file uploads
    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/pancakes.inkvell.ai /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 5: Install SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d pancakes.inkvell.ai
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot will automatically:
- Obtain SSL certificate
- Configure Nginx for HTTPS
- Set up auto-renewal

## Step 6: Update Docker Compose Configuration

On your DigitalOcean server, update the docker-compose.yml:

```bash
cd ~/latex-copy
nano docker-compose.prod.yml
```

Make sure these environment variables are set:

```yaml
environment:
  OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
  GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback
  SUPABASE_URL: https://ikbtchgrensgpvzthwqp.supabase.co
  SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRjaGdyZW5zZ3B2enRod3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjYwNTkxNywiZXhwIjoyMDgyMTgxOTE3fQ.HsXH0UCoxUGCqoX7WtSH2ai5gWIx-5kHOX1E5XZfwpY
  GOOGLE_CLIENT_ID: YOUR_GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET: YOUR_GOOGLE_CLIENT_SECRET
```

Restart services:

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Step 7: Configure Local Development

For local development, update your local `docker-compose.yml`:

```yaml
environment:
  OVERLEAF_SITE_URL: http://localhost
  GOOGLE_CALLBACK_URL: http://localhost/auth/google/callback
  # ... other vars same as production
```

## Step 8: Test

1. **Test DNS:**
   ```bash
   curl -I http://pancakes.inkvell.ai
   ```

2. **Test HTTPS:**
   ```bash
   curl -I https://pancakes.inkvell.ai
   ```

3. **Test Login:**
   - Visit: `https://pancakes.inkvell.ai/login`
   - Click "Continue with Google"
   - Verify OAuth flow works

## Troubleshooting

### DNS not resolving?
- Wait 5-60 minutes for propagation
- Check DNS records are correct
- Use `dig` or `nslookup` to verify

### Nginx 502 Bad Gateway?
- Check Docker containers are running: `docker ps`
- Check InkVell logs: `docker compose logs inkvell`
- Verify proxy_pass points to correct port

### SSL certificate issues?
- Ensure DNS is resolving before running certbot
- Check firewall allows port 80/443
- Verify domain ownership

### OAuth not working?
- Check redirect URI matches exactly in Google Console
- Verify `GOOGLE_CALLBACK_URL` matches your domain
- Check server logs for errors

## Firewall Configuration

Make sure these ports are open:

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Quick Commands Reference

```bash
# Check DNS
dig pancakes.inkvell.ai

# Check Nginx status
sudo systemctl status nginx

# Check Docker containers
docker compose ps

# View logs
docker compose logs -f inkvell

# Restart services
docker compose restart

# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

