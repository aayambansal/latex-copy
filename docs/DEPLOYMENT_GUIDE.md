# InkVell Deployment Guide - pancakes.inkvell.ai

## Prerequisites

1. **Supabase Setup**
   - Run the SQL migration in `supabase-migration.sql` in your Supabase SQL Editor
   - This creates the `users` table with proper indexes and RLS policies

2. **Google OAuth Setup**
   - The OAuth credentials are already configured
   - Make sure the authorized redirect URI includes: `https://pancakes.inkvell.ai/auth/google/callback`

3. **Domain Configuration**
   - Point `pancakes.inkvell.ai` to your server IP
   - Set up SSL certificate (Let's Encrypt recommended)

## Deployment Steps

### 1. Update Google OAuth Redirect URI

In Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://pancakes.inkvell.ai/auth/google/callback`
4. Save changes

### 2. Run Supabase Migration

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase-migration.sql`
4. Verify the `users` table was created

### 3. Deploy with Docker Compose

```bash
cd overleaf
docker compose down
docker compose up -d
```

### 4. Configure Nginx (if using reverse proxy)

Create `/etc/nginx/sites-available/pancakes.inkvell.ai`:

```nginx
server {
    listen 80;
    server_name pancakes.inkvell.ai;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Set up SSL with Let's Encrypt

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d pancakes.inkvell.ai
```

### 6. Verify Deployment

1. Visit `https://pancakes.inkvell.ai/login`
2. You should see the login page with a "Continue with Google" button
3. Test Google OAuth login
4. Verify user is created in both Supabase and MongoDB

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY` or `SUPABASE_SERVICE_KEY`: Your Supabase service role key (for backend operations)
  - **Important**: Use the service role key from Supabase Settings > API, not the anon/publishable key
  - The service role key bypasses RLS and allows full database access
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: OAuth callback URL
- `OVERLEAF_SITE_URL`: Your domain URL

## Troubleshooting

### Google OAuth not working
- Verify redirect URI matches exactly in Google Console
- Check that `GOOGLE_CALLBACK_URL` matches your domain
- Check server logs: `docker compose logs -f inkvell`

### Supabase connection issues
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase dashboard for API status
- Verify RLS policies allow service role access

### Domain not resolving
- Check DNS records point to server IP
- Verify firewall allows port 80/443
- Check nginx/SSL configuration

## Features Implemented

✅ Google OAuth authentication
✅ Supabase database integration
✅ User synchronization between Supabase and MongoDB
✅ Login page with Google OAuth button
✅ Automatic user creation on first login
✅ Domain configuration for pancakes.inkvell.ai

