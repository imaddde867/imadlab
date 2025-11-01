# Strava API Integration Setup Guide

## Step 1: Create a Strava API Application

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create App" or use an existing app
3. Fill in the application details:
   - **Application Name**: Your app name (e.g., "Imadlab Portfolio")
   - **Category**: Choose appropriate category
   - **Website**: https://imadlab.me
   - **Authorization Callback Domain**: localhost,imadlab.me
4. Note down your **Client ID** and **Client Secret**

## Step 2: Get Your Refresh Token

You need to authorize your app to access your Strava data:

1. Replace `YOUR_CLIENT_ID` in the URL below and visit it in your browser:
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=activity:read_all
   ```

2. Click "Authorize" - you'll be redirected to a URL like:
   ```
   http://localhost/?state=&code=AUTHORIZATION_CODE&scope=read,activity:read_all
   ```

3. Copy the `code` parameter from the URL

4. Exchange the code for a refresh token using curl (replace YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, and AUTHORIZATION_CODE):
   ```bash
   curl -X POST https://www.strava.com/oauth/token \
     -d client_id=YOUR_CLIENT_ID \
     -d client_secret=YOUR_CLIENT_SECRET \
     -d code=AUTHORIZATION_CODE \
     -d grant_type=authorization_code
   ```

5. The response will contain your `refresh_token`:
   ```json
   {
     "token_type": "Bearer",
     "expires_at": 1234567890,
     "expires_in": 21600,
     "refresh_token": "YOUR_REFRESH_TOKEN",
     "access_token": "YOUR_ACCESS_TOKEN"
   }
   ```

## Step 3: Deploy Supabase Edge Function

The Strava API doesn't allow direct browser requests due to CORS. We use a Supabase Edge Function as a proxy.

1. **Deploy the function:**
   ```bash
   npx supabase functions deploy strava-proxy
   ```

2. **Set the secrets in Supabase:**
   ```bash
   npx supabase secrets set STRAVA_CLIENT_ID=your_client_id_here
   npx supabase secrets set STRAVA_CLIENT_SECRET=your_client_secret_here
   npx supabase secrets set STRAVA_REFRESH_TOKEN=your_refresh_token_here
   ```

   Or set them in the Supabase Dashboard:
   - Go to your project at https://supabase.com/dashboard
   - Navigate to **Edge Functions** → **strava-proxy** → **Settings**
   - Add the three secrets

## Step 4: Test the Integration

Run the development server:
```bash
npm run dev
```

Visit `/extras` to see your Strava stats!

## Notes

- The credentials are stored securely in Supabase Edge Function secrets (not in your code)
- The Edge Function acts as a proxy to avoid CORS issues
- Data is cached for 5 minutes to reduce API calls
- The integration shows:
  - Year-to-date stats (runs/rides)
  - All-time stats
  - Recent activities (last 5)

## Troubleshooting

- **Failed to fetch**: Make sure the Edge Function is deployed and secrets are set
- **401 Unauthorized**: Check your Strava credentials in Supabase secrets
- **Missing data**: Ensure you authorized with `activity:read_all` scope
- **Function not found**: Run `npx supabase functions deploy strava-proxy`
