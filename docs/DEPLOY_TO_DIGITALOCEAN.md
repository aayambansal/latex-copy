# 🚀 Deploy InkVell to DigitalOcean

## Quick Deploy (Recommended)

### Step 1: Commit & Push Changes

All changes have been committed and pushed to GitHub.

### Step 2: Deploy to DigitalOcean

**Option A: One-Command Deploy (Easiest)**

SSH into your DigitalOcean droplet and run:

```bash
curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/scripts/complete-deploy.sh | bash
```

**Option B: Manual Deploy**

1. **SSH into your droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Clone the latest code:**
   ```bash
   cd ~
   rm -rf inkvell  # Remove old version if exists
   git clone https://github.com/aayambansal/latex-copy.git inkvell
   cd inkvell/overleaf
   ```

3. **Update docker-compose.yml for production:**
   
   Edit `docker-compose.yml` and update:
   - `OVERLEAF_SITE_URL` to your domain (e.g., `https://pancakes.inkvell.ai`)
   - `GOOGLE_CALLBACK_URL` to `https://pancakes.inkvell.ai/auth/google/callback`
   - Add your production environment variables

4. **Start services:**
   ```bash
   docker compose down  # Stop old version
   docker compose pull  # Pull latest images
   docker compose up -d # Start new version
   ```

5. **Verify deployment:**
   ```bash
   docker compose ps
   docker compose logs -f inkvell
   ```

## Update Existing Deployment

If you already have InkVell running on DigitalOcean:

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Navigate to project
cd ~/inkvell/overleaf  # or wherever you cloned it

# Pull latest changes
git pull origin main

# Restart services with new code
docker compose down
docker compose up -d

# Check status
docker compose ps
docker compose logs -f inkvell
```

## Production Configuration

Make sure to update these in `docker-compose.yml`:

```yaml
environment:
  OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
  GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback
  OVERLEAF_APP_NAME: InkVell
  # ... other settings
```

## Verify Deployment

1. Visit your domain: `https://pancakes.inkvell.ai`
2. Check login page has Google OAuth button
3. Verify branding shows "InkVell" not "Overleaf"
4. Test compilation works

## Troubleshooting

**Services won't start?**
```bash
docker compose logs -f
```

**Need to rebuild?**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Check if code is updated:**
```bash
cd ~/inkvell
git log -1  # Should show latest commit
```

## Next Steps

1. ✅ Code is committed and pushed to GitHub
2. ✅ Deploy to DigitalOcean using commands above
3. ✅ Update Google OAuth redirect URI in Google Cloud Console
4. ✅ Test login and compilation

