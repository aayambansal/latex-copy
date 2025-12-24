# Google OAuth Configuration Guide

## Required Google Cloud Console Settings

To enable Google login, you need to configure the following in your Google Cloud Console:

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application** as the application type

### 2. Configure Authorized Redirect URIs

**For Local Development:**
```
http://localhost/auth/google/callback
```

**For Production (inkvell.ai):**
```
https://pancakes.inkvell.ai/auth/google/callback
```

**Important:** You must add BOTH URLs if you want to test locally and deploy to production.

### 3. Get Your Credentials

After creating the OAuth client:
- **Client ID**: Copy this value (looks like: `520061524788-xxxxx.apps.googleusercontent.com`)
- **Client Secret**: Copy this value (looks like: `GOCSPX-xxxxx`)

### 4. Configure Environment Variables

**In `docker-compose.yml`:**

```yaml
environment:
  # Google OAuth Configuration
  GOOGLE_CLIENT_ID: your-client-id-here
  GOOGLE_CLIENT_SECRET: your-client-secret-here
  GOOGLE_CALLBACK_URL: http://localhost/auth/google/callback  # For local dev
  # For production, use:
  # GOOGLE_CALLBACK_URL: https://pancakes.inkvell.ai/auth/google/callback
  
  # Site URL (required for callback URL construction)
  OVERLEAF_SITE_URL: http://localhost  # For local dev
  # For production, use:
  # OVERLEAF_SITE_URL: https://pancakes.inkvell.ai
```

### 5. OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in:
   - **App name**: InkVell
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (if in testing mode) or publish the app

### 6. Current Configuration

Replace these placeholders with your actual credentials:
- **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

**Make sure these credentials have the following Authorized Redirect URIs:**
- `http://localhost/auth/google/callback` (for local testing)
- `https://pancakes.inkvell.ai/auth/google/callback` (for production)

### 7. Testing

1. Restart your Docker containers:
   ```bash
   docker compose restart inkvell
   ```

2. Visit: `http://localhost/login`

3. Click "Sign in with Google"

4. You should be redirected to Google's OAuth consent screen

5. After authorizing, you'll be redirected back to `/auth/google/callback`

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that the redirect URI in Google Console exactly matches: `http://localhost/auth/google/callback`
- Make sure there are no trailing slashes or extra characters

**Error: "404 Not Found" on /auth/google**
- Check that the route is registered in `router.mjs`
- Verify that `setupGoogleStrategy()` is called in `Server.mjs`
- Check web service logs: `docker compose logs web-overleaf`

**Error: "invalid_client"**
- Verify your Client ID and Client Secret are correct
- Make sure the OAuth consent screen is configured
- Check that the credentials are for the correct project

### Security Notes

- Never commit your Client Secret to version control
- Use environment variables for sensitive credentials
- For production, use HTTPS URLs only
- Regularly rotate your OAuth credentials

