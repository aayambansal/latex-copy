# 🚀 Quick Deployment Guide

## Code Status: ✅ Committed & Pushed

All changes are on GitHub: `https://github.com/aayambansal/latex-copy`

## Deploy to DigitalOcean

### One-Command Deploy

```bash
ssh root@YOUR_DROPLET_IP
curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/scripts/complete-deploy.sh | bash
```

### Update Existing Deployment

```bash
ssh root@YOUR_DROPLET_IP
cd ~/inkvell/overleaf
git pull origin main
# Edit docker-compose.yml with your credentials
docker compose down
docker compose up -d
```

## Before Deploying

1. **Set environment variables** in `docker-compose.yml`:
   - `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth Secret
   - `OVERLEAF_SITE_URL` - Your domain (e.g., `https://pancakes.inkvell.ai`)

2. **Update Google Cloud Console**:
   - Add redirect URI: `https://pancakes.inkvell.ai/auth/google/callback`

3. **Configure DNS**:
   - Point `pancakes.inkvell.ai` to your droplet IP

## Full Documentation

See [`docs/DEPLOY_TO_DIGITALOCEAN.md`](./docs/DEPLOY_TO_DIGITALOCEAN.md) for complete instructions.

