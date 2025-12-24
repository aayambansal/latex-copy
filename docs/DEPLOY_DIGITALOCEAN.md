# 🚀 Complete DigitalOcean Deployment Guide

Step-by-step guide to deploy InkVell on your DigitalOcean droplet.

## Prerequisites

- ✅ DigitalOcean droplet created
- ✅ SSH public key ready
- ✅ GitHub repo: https://github.com/aayambansal/latex-copy

---

## Step 1: Add SSH Key to DigitalOcean

1. **Go to DigitalOcean Dashboard** → **Settings** → **Security** → **SSH Keys**
2. **Click "Add SSH Key"**
3. **Paste your public key**:
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEblGNfuZKX2V+75wiB7AZYiU8l/WgBjuWhL8yQPuGTS aayambansal@Aayams-MacBook-Pro-3.local
   ```
4. **Give it a name** (e.g., "MacBook Pro")
5. **Save**

---

## Step 2: Connect to Your Droplet

1. **Get your droplet IP** from DigitalOcean dashboard
2. **Open Terminal** on your Mac
3. **Connect via SSH**:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```
   
   Replace `YOUR_DROPLET_IP` with your actual droplet IP address.

4. **If prompted**, type `yes` to accept the fingerprint
5. You should now be logged into your droplet!

---

## Step 3: Deploy InkVell

Once connected to your droplet, run:

```bash
curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/complete-deploy.sh | bash
```

**OR** manually:

```bash
# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
apt-get install -y docker-compose-plugin

# Clone repository
cd ~
git clone https://github.com/aayambansal/latex-copy.git
cd latex-copy

# Run deployment script
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

---

## Step 4: Wait for Deployment

The deployment will:
1. ✅ Install Docker and Docker Compose (~2 minutes)
2. ✅ Clone your repository (~30 seconds)
3. ✅ Pull Docker images (~5-10 minutes, ~2GB download)
4. ✅ Start all services (~2 minutes)
5. ✅ Initialize MongoDB replica set (~1 minute)

**Total time: ~10-15 minutes**

---

## Step 5: Verify Deployment

### Check Service Status

```bash
cd ~/latex-copy
docker compose -f docker-compose.prod.yml ps
```

All services should show "Up" status.

### Check Logs

```bash
docker compose -f docker-compose.prod.yml logs -f inkvell
```

Press `Ctrl+C` to exit logs.

### Test MongoDB Replica Set

```bash
docker exec -it inkvell-mongo mongosh --eval "rs.status()"
```

Should show replica set status.

---

## Step 6: Access Your Application

1. **Get your droplet IP** from DigitalOcean dashboard
2. **Open in browser**: `http://YOUR_DROPLET_IP`
3. **Wait 1-2 minutes** if you just deployed (services need to fully start)
4. You should see the InkVell login page! 🎉

---

## Step 7: Set Up Domain (Optional but Recommended)

### 7.1 Point Domain to Droplet

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add an **A Record**:
   - **Host**: `@` (or `www`)
   - **Type**: `A`
   - **Value**: Your droplet IP
   - **TTL**: 3600

### 7.2 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)
```

Your site will now be accessible at `https://yourdomain.com` with SSL! 🔒

---

## Step 8: Configure Firewall (Important!)

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Useful Commands

### View All Logs
```bash
cd ~/latex-copy
docker compose -f docker-compose.prod.yml logs -f
```

### View Specific Service Logs
```bash
docker compose -f docker-compose.prod.yml logs -f inkvell
docker compose -f docker-compose.prod.yml logs -f mongo
docker compose -f docker-compose.prod.yml logs -f redis
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Stop Services
```bash
docker compose -f docker-compose.prod.yml down
```

### Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### Update Application
```bash
cd ~/latex-copy
git pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --pull always
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
systemctl status docker

# Check logs
docker compose -f docker-compose.prod.yml logs

# Restart Docker
systemctl restart docker
```

### MongoDB Replica Set Not Initialized

```bash
docker exec -it inkvell-mongo mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo:27017'}]})"
```

### Port 80 Already in Use

```bash
# Check what's using port 80
netstat -tulpn | grep :80

# Stop conflicting service or change port in docker-compose.prod.yml
```

### Can't Access Application

1. **Check firewall**: `ufw status`
2. **Check services are running**: `docker compose ps`
3. **Check logs**: `docker compose logs inkvell`
4. **Wait 2-3 minutes** after deployment for services to fully start

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a

# Remove unused volumes (be careful!)
docker volume prune
```

---

## Security Best Practices

1. ✅ **Set up firewall** (Step 8 above)
2. ✅ **Use SSH keys** (already done)
3. ✅ **Disable password authentication**:
   ```bash
   nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   systemctl restart sshd
   ```
4. ✅ **Set up SSL** (Step 7.2 above)
5. ✅ **Keep system updated**:
   ```bash
   apt-get update && apt-get upgrade -y
   ```
6. ✅ **Set up automatic backups** (see below)

---

## Set Up Backups (Recommended)

### Manual Backup Script

Create `~/backup-inkvell.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec inkvell-mongo mongodump --archive=/tmp/mongo-backup.archive
docker cp inkvell-mongo:/tmp/mongo-backup.archive $BACKUP_DIR/mongo_$DATE.archive

# Backup volumes
docker run --rm -v inkvell_inkvell-data:/data -v $BACKUP_DIR:/backup ubuntu tar czf /backup/inkvell-data_$DATE.tar.gz -C /data .

echo "Backup completed: $BACKUP_DIR"
```

Make it executable:
```bash
chmod +x ~/backup-inkvell.sh
```

### Schedule Daily Backups

```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```
0 2 * * * /root/backup-inkvell.sh
```

---

## Monitoring

### Check Resource Usage

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Docker stats
docker stats
```

### Set Up Monitoring (Optional)

Consider using:
- **DigitalOcean Monitoring** (built-in)
- **UptimeRobot** (free uptime monitoring)
- **Grafana + Prometheus** (advanced)

---

## Next Steps

1. ✅ **Test your deployment** - Create a LaTeX document
2. ✅ **Set up domain** - Point your domain to the droplet
3. ✅ **Install SSL** - Secure your site with HTTPS
4. ✅ **Configure backups** - Protect your data
5. ✅ **Set up monitoring** - Track uptime and performance

---

## Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify services: `docker compose ps`
3. Check MongoDB: `docker exec -it inkvell-mongo mongosh --eval "rs.status()"`
4. Review this guide's troubleshooting section

---

**Your InkVell instance should now be live! 🎉**

Access it at: `http://YOUR_DROPLET_IP`

