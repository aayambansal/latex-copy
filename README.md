# InkVell - LaTeX Editor

A beautiful, self-hosted LaTeX editor based on Overleaf Community Edition.

## 🚀 Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/inkvell)

### Quick Deploy

1. Click the button above or go to [Railway](https://railway.app)
2. Create a new project from this GitHub repo
3. Railway will automatically:
   - Build the Docker image
   - Set up the required services (MongoDB, Redis)
   - Deploy the application

### Environment Variables

Set these in your Railway project settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `OVERLEAF_APP_NAME` | Application name | `InkVell` |
| `OVERLEAF_MONGO_URL` | MongoDB connection string | Auto-configured |
| `OVERLEAF_REDIS_HOST` | Redis host | Auto-configured |
| `OVERLEAF_ALLOW_PUBLIC_ACCESS` | Allow public access without login | `true` |

## 🖥️ Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+

### Run Locally

```bash
cd overleaf/develop
docker compose up -d
```

Access at: http://localhost

### Build from Source

```bash
cd overleaf/develop
docker compose build
docker compose up -d
```

## 📦 Architecture

InkVell consists of several services:

- **Web**: Main application server
- **CLSI**: LaTeX compilation service
- **MongoDB**: Document database
- **Redis**: Cache and session storage
- **Real-time**: WebSocket connections

## 🎨 Features

- ✅ Full LaTeX support (TeX Live)
- ✅ Real-time collaboration
- ✅ PDF preview
- ✅ Project management
- ✅ File upload (including ZIP)
- ✅ No login required (public access mode)
- ✅ Beautiful, modern UI

## 📄 License

Based on Overleaf Community Edition (AGPL-3.0)

