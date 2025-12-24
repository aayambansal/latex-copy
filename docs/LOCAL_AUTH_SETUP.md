# Local Development Auth Setup

## Quick Setup for Local Development

### 1. Update Local Docker Compose

Edit `overleaf/docker-compose.yml` and ensure these environment variables:

```yaml
environment:
  OVERLEAF_SITE_URL: http://localhost
  GOOGLE_CALLBACK_URL: http://localhost/auth/google/callback
  
  # Supabase (same as production)
  SUPABASE_URL: https://ikbtchgrensgpvzthwqp.supabase.co
  SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrYnRjaGdyZW5zZ3B2enRod3FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjYwNTkxNywiZXhwIjoyMDgyMTgxOTE3fQ.HsXH0UCoxUGCqoX7WtSH2ai5gWIx-5kHOX1E5XZfwpY
  
  # Google OAuth - Replace with your actual credentials
  GOOGLE_CLIENT_ID: YOUR_GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET: YOUR_GOOGLE_CLIENT_SECRET
```

### 2. Add Localhost to Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   - `http://localhost/auth/google/callback`
   - `http://localhost:80/auth/google/callback` (if using port 80)
   - `http://127.0.0.1/auth/google/callback` (alternative)
5. Click **Save**

### 3. Install Dependencies

```bash
cd overleaf/services/web
npm install
```

### 4. Start Services

```bash
cd overleaf
docker compose down
docker compose up -d
```

### 5. Access Locally

- **Login Page**: http://localhost/login
- **Google OAuth**: Will redirect to Google, then back to localhost

## Testing Both Environments

### Production (pancakes.inkvell.ai)
- URL: `https://pancakes.inkvell.ai/login`
- Uses production Supabase database
- OAuth callback: `https://pancakes.inkvell.ai/auth/google/callback`

### Local Development
- URL: `http://localhost/login`
- Uses same Supabase database (shared)
- OAuth callback: `http://localhost/auth/google/callback`

## Important Notes

1. **Shared Database**: Both local and production use the same Supabase database, so users created locally will appear in production and vice versa.

2. **OAuth Redirects**: Make sure both URLs are added to Google OAuth authorized redirect URIs.

3. **Environment Variables**: The `OVERLEAF_SITE_URL` and `GOOGLE_CALLBACK_URL` should match your environment (localhost vs production domain).

4. **Port Configuration**: If you're using a different port locally (e.g., 3000), update the callback URL accordingly.

## Troubleshooting Local Auth

### OAuth redirects to wrong URL?
- Check `GOOGLE_CALLBACK_URL` matches exactly what's in Google Console
- Verify `OVERLEAF_SITE_URL` is set correctly

### Can't connect to Supabase?
- Check `SUPABASE_SERVICE_KEY` is correct
- Verify network connectivity
- Check Supabase dashboard for API status

### Users not being created?
- Check Docker logs: `docker compose logs -f inkvell`
- Verify Supabase migration was run
- Check RLS policies allow service role access

