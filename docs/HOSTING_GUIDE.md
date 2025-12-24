# 🚀 Complete Hosting Guide for InkVell

This guide covers the best hosting options for your InkVell LaTeX editor, ranked by ease of setup and use case.

## 📋 Requirements

InkVell needs:
- **Main Application**: Node.js-based web service
- **MongoDB**: Database (requires replica set)
- **Redis**: Cache and session storage
- **Storage**: Persistent volumes for user data
- **Resources**: ~2GB RAM minimum, 4GB+ recommended

---

## 🥇 Option 1: Railway (Easiest - Recommended for Quick Start)

**Best for**: Quick deployment, minimal configuration, automatic scaling

### Pros
- ✅ One-click deployment
- ✅ Automatic SSL certificates
- ✅ Built-in MongoDB and Redis
- ✅ Auto-scaling
- ✅ Free tier available ($5 credit/month)
- ✅ No server management

### Cons
- ⚠️ Can be expensive at scale (~$20-50/month)
- ⚠️ Less control over infrastructure

### Quick Deploy Steps

1. **Sign up at [Railway.app](https://railway.app)**

2. **Create New Project** → "Deploy from GitHub repo"

3. **Add Services**:
   - Main service: Uses your `Dockerfile` (already configured)
   - MongoDB: Add from Railway's template
   - Redis: Add from Railway's template

4. **Set Environment Variables**:
   ```
   OVERLEAF_APP_NAME=InkVell
   OVERLEAF_MONGO_URL=<Railway MongoDB URL>
   OVERLEAF_REDIS_HOST=<Railway Redis Host>
   OVERLEAF_REDIS_PORT=<Railway Redis Port>
   OVERLEAF_ALLOW_PUBLIC_ACCESS=true
   EMAIL_CONFIRMATION_DISABLED=true
   ```

5. **Deploy!** Railway handles the rest automatically.

**Cost**: ~$5-20/month (depending on usage)

---

## 🥈 Option 2: DigitalOcean Droplet (Best Value)

**Best for**: Cost-effective, full control, production use

### Pros
- ✅ Predictable pricing ($6-12/month)
- ✅ Full server control
- ✅ Good performance
- ✅ Easy to scale
- ✅ Can add managed databases later

### Cons
- ⚠️ Requires basic Linux knowledge
- ⚠️ Manual SSL setup (use Let's Encrypt)
- ⚠️ You manage updates

### Deployment Steps

1. **Create Droplet**:
   - Ubuntu 22.04 LTS
   - Minimum: 2GB RAM, 1 vCPU ($12/month)
   - Recommended: 4GB RAM, 2 vCPU ($24/month)

2. **SSH into your droplet**:
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Run the deployment script**:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/aayambansal/latex-copy/main/complete-deploy.sh | bash
   ```
   
   Or manually:
   ```bash
   git clone https://github.com/aayambansal/latex-copy.git
   cd latex-copy
   chmod +x deploy-digitalocean.sh
   ./deploy-digitalocean.sh
   ```

4. **Set up SSL (Optional but recommended)**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

**Cost**: $12-24/month + domain (~$10/year)

---

## 🥉 Option 3: AWS/GCP/Azure (Enterprise Scale)

**Best for**: Large scale, enterprise, high availability

### Pros
- ✅ Highly scalable
- ✅ Managed services (RDS MongoDB, ElastiCache Redis)
- ✅ Global CDN support
- ✅ Enterprise-grade reliability

### Cons
- ⚠️ Complex setup
- ⚠️ Can be expensive
- ⚠️ Steep learning curve

### Quick Setup (AWS ECS/Fargate)

1. **Create ECS Cluster**
2. **Set up RDS for MongoDB** (or use DocumentDB)
3. **Set up ElastiCache for Redis**
4. **Deploy container** using ECS Fargate
5. **Configure ALB** for load balancing

**Cost**: $50-200+/month (depending on scale)

---

## 🏠 Option 4: Self-Hosted (Home Server/VPS)

**Best for**: Learning, development, privacy-focused

### Pros
- ✅ Complete control
- ✅ No monthly fees (if using existing hardware)
- ✅ Privacy (data stays on your server)

### Cons
- ⚠️ Requires technical knowledge
- ⚠️ You handle all maintenance
- ⚠️ Need static IP or dynamic DNS

### Local Deployment

```bash
cd overleaf/develop
docker compose up -d
```

Access at: `http://localhost`

---

## 📊 Comparison Table

| Option | Ease | Cost/Month | Scalability | Maintenance |
|--------|------|------------|-------------|-------------|
| **Railway** | ⭐⭐⭐⭐⭐ | $5-20 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **DigitalOcean** | ⭐⭐⭐ | $12-24 | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **AWS/GCP** | ⭐⭐ | $50-200+ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Self-Hosted** | ⭐⭐ | $0-10 | ⭐⭐ | ⭐ |

---

## 🎯 Recommended Approach

### For Quick Start / Testing
→ **Railway** (15 minutes to deploy)

### For Production / Cost-Effective
→ **DigitalOcean Droplet** ($12/month, full control)

### For Enterprise / Scale
→ **AWS/GCP** with managed services

---

## 🔧 Post-Deployment Checklist

After deploying, ensure:

- [ ] MongoDB replica set is initialized
- [ ] Redis is accessible
- [ ] Application is accessible via HTTP/HTTPS
- [ ] SSL certificate is configured (production)
- [ ] Backups are set up (DigitalOcean/AWS)
- [ ] Monitoring is configured
- [ ] Domain is pointed to your server (if applicable)

---

## 🆘 Troubleshooting

### MongoDB Replica Set Issues
```bash
docker exec -it inkvell-mongo mongosh
rs.initiate({ _id: 'inkvell', members: [{ _id: 0, host: 'mongo:27017' }] })
```

### Check Service Status
```bash
docker compose ps
docker compose logs -f inkvell
```

### Restart Services
```bash
docker compose restart
```

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [DigitalOcean Docker Guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04)
- [Overleaf Community Edition Docs](https://github.com/overleaf/overleaf)

---

## 💡 Pro Tips

1. **Start with Railway** for quick testing, then migrate to DigitalOcean for production
2. **Use managed databases** (MongoDB Atlas, Redis Cloud) for better reliability
3. **Set up automated backups** for production deployments
4. **Monitor resource usage** - LaTeX compilation can be CPU-intensive
5. **Use a CDN** for static assets if you have many users

---

Need help? Check the deployment scripts in this repo or open an issue!

