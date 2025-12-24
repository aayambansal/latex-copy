# 🚀 Deploy InkVell to DigitalOcean

## ✅ Code is Committed & Pushed

All changes have been successfully pushed to GitHub: `https://github.com/aayambansal/latex-copy`

## 🚀 Deploy to DigitalOcean

### Option 1: Fresh Deployment (New Server)

SSH into your DigitalOcean droplet and run:

```bash
curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/scripts/complete-deploy.sh | bash
```

This will:
- Install Docker & Docker Compose
- Clone the latest code
- Set up and start all services
- Configure everything automatically

### Option 2: Update Existing Deployment

If you already have InkVell running:

```bash
# 1. SSH into your droplet
ssh root@YOUR_DROPLET_IP

# 2. Navigate to project directory
cd ~/inkvell/overleaf  # or wherever you cloned it

# 3. Pull latest changes
git pull origin main

# 4. Stop old services
docker compose down

# 5. Update docker-compose.yml with your credentials
# Edit docker-compose.yml and set:
#   - GOOGLE_CLIENT_ID: your_actual_client_id
#   - GOOGLE_CLIENT_SECRET: your_actual_client_secret
#   - OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
#   - GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback

# 6. Start services with updated code
docker compose up -d

# 7. Verify deployment
docker compose ps
docker compose logs -f inkvell
```

### Option 3: Manual Step-by-Step

1. **SSH into droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Clone/Update repository:**
   ```bash
   cd ~
   rm -rf inkvell  # Remove old if exists
   git clone https://github.com/aayambansal/latex-copy.git inkvell
   cd inkvell/overleaf
   ```

3. **Configure environment variables:**
   
   Edit `docker-compose.yml` and update these values:
   ```yaml
   environment:
     OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
     GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback
     GOOGLE_CLIENT_ID: your_actual_google_client_id
     GOOGLE_CLIENT_SECRET: your_actual_google_client_secret
     SUPABASE_URL: your_supabase_url
     SUPABASE_SERVICE_KEY: your_supabase_service_key
   ```

4. **Start services:**
   ```bash
   docker compose up -d
   ```

5. **Wait for services to start:**
   ```bash
   sleep 60
   docker compose ps
   ```

6. **Check logs:**
   ```bash
   docker compose logs -f inkvell
   ```

## 🔧 Production Configuration Checklist

Before deploying, make sure:

- [ ] **Google OAuth** - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `docker-compose.yml`
- [ ] **Site URL** - Set `OVERLEAF_SITE_URL` to your domain (e.g., `https://pancakes.inkvell.ai`)
- [ ] **Callback URL** - Set `GOOGLE_CALLBACK_URL` to match your domain
- [ ] **Google Console** - Add redirect URI: `https://pancakes.inkvell.ai/auth/google/callback`
- [ ] **Supabase** - Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` if using Supabase
- [ ] **DNS** - Point your domain to the droplet IP
- [ ] **SSL** - Set up SSL certificate (Let's Encrypt via Certbot)

## 📋 Post-Deployment Steps

1. **Verify deployment:**
   ```bash
   curl -I https://pancakes.inkvell.ai
   ```

2. **Test login:**
   - Visit: `https://pancakes.inkvell.ai/login`
   - Should see "Sign in with Google" button
   - Should see "InkVell" branding (not Overleaf)

3. **Test compilation:**
   - Create a test project
   - Try compiling a LaTeX document
   - Should work without errors

## 🔄 Update Existing Deployment

To update an existing deployment with new code:

```bash
# On your DigitalOcean droplet
cd ~/inkvell/overleaf
git pull origin main
docker compose down
docker compose up -d
docker compose logs -f inkvell
```

## 🐛 Troubleshooting

**Services won't start?**
```bash
docker compose logs -f
```

**Code not updating?**
```bash
git pull origin main
docker compose restart inkvell
```

**Check if latest code is deployed:**
```bash
cd ~/inkvell
git log -1  # Should show latest commit
```

**View service status:**
```bash
docker compose ps
```

## 📝 Important Notes

- **Secrets removed from code** - You must set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as environment variables
- **Local development** - Uses `http://localhost` URLs
- **Production** - Must use `https://pancakes.inkvell.ai` URLs
- **Google OAuth** - Must add redirect URI in Google Cloud Console

## 🎯 Quick Reference

**Deploy:** `curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/scripts/complete-deploy.sh | bash`

**Update:** `cd ~/inkvell/overleaf && git pull && docker compose restart`

**Logs:** `docker compose logs -f inkvell`

**Status:** `docker compose ps`
