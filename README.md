# InkVell - LaTeX Editor

A beautiful, self-hosted LaTeX editor based on Overleaf Community Edition.

## 🚀 Quick Start

### Local Development

```bash
cd overleaf
docker compose up -d
```

Access at: **http://localhost**

Wait 1-2 minutes for all services to start.

### Login Credentials (Test User)

- **Email:** `aayambansal@gmail.com`
- **Password:** `aayam`

## 📁 Project Structure

```
.
├── overleaf/              # Main application code
├── docs/                  # Documentation
├── scripts/               # Deployment & utility scripts
├── database/              # SQL migrations & user creation scripts
├── docker-compose.yml     # Main Docker Compose configuration
├── Dockerfile             # Docker image definition
└── railway.toml          # Railway deployment config
```

## 📚 Documentation

All documentation is in the [`docs/`](./docs/) directory:

- **[Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[Hosting Guide](./docs/HOSTING_GUIDE.md)** - All hosting options explained
- **[Domain Setup](./docs/DOMAIN_SETUP_GUIDE.md)** - Configure custom domains
- **[Google OAuth Setup](./docs/GOOGLE_OAUTH_CONFIGURATION.md)** - Google login configuration
- **[Local Auth Setup](./docs/LOCAL_AUTH_SETUP.md)** - Email/password authentication

## 🛠️ Scripts

Deployment and utility scripts are in [`scripts/`](./scripts/):

- `complete-deploy.sh` - Full deployment script
- `deploy-digitalocean.sh` - DigitalOcean deployment
- `restart-deployment.sh` - Restart services

## 🗄️ Database

SQL migrations and user management scripts are in [`database/`](./database/):

- `supabase-migration.sql` - Initial Supabase schema
- `add-password-column.sql` - Add password support
- `add-user-to-supabase.sql` - Create test user in Supabase

## 🎨 Features

- ✅ Full LaTeX support (TeX Live)
- ✅ Real-time collaboration
- ✅ PDF preview
- ✅ Google OAuth login
- ✅ Email/password authentication
- ✅ Project management
- ✅ File upload (including ZIP)
- ✅ Beautiful, modern UI

## 📦 Architecture

InkVell consists of several services:

- **Web**: Main application server
- **CLSI**: LaTeX compilation service
- **MongoDB**: Document database
- **Redis**: Cache and session storage
- **Real-time**: WebSocket connections

## 🔧 Configuration

### Environment Variables

Key environment variables (see `overleaf/docker-compose.yml`):

| Variable | Description | Default |
|----------|-------------|---------|
| `OVERLEAF_APP_NAME` | Application name | `InkVell` |
| `OVERLEAF_MONGO_URL` | MongoDB connection | `mongodb://mongo/inkvell` |
| `OVERLEAF_REDIS_HOST` | Redis host | `redis` |
| `OVERLEAF_ALLOW_PUBLIC_ACCESS` | Allow public access | `true` |
| `EMAIL_CONFIRMATION_DISABLED` | Disable email confirmation | `true` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | (see docker-compose.yml) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | (see docker-compose.yml) |
| `SUPABASE_URL` | Supabase project URL | (see docker-compose.yml) |
| `SUPABASE_SERVICE_KEY` | Supabase service key | (see docker-compose.yml) |

## 🐳 Docker Commands

```bash
# Start services
cd overleaf && docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Check status
docker compose ps
```

## 📄 License

Based on Overleaf Community Edition (AGPL-3.0)
