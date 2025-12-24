# Deployment Scripts

## Available Scripts

### Deployment

- **`complete-deploy.sh`** - Complete deployment script for fresh servers
- **`deploy-digitalocean.sh`** - DigitalOcean-specific deployment
- **`deploy-auto.sh`** - Automated deployment script

### Management

- **`restart-deployment.sh`** - Restart all services
- **`run-on-server.sh`** - Execute commands on remote server

### Quick Deploy

- **`QUICK_DEPLOY_COMMAND.sh`** - Quick deployment command
- **`QUICK_DEPLOY_COMMANDS.sh`** - Multiple quick deploy commands

## Usage

Most scripts are designed to be run on the target server. Check individual scripts for specific usage instructions.

For local development, use:
```bash
cd ../overleaf
docker compose up -d
```

