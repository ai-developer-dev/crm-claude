# Railway Deployment Guide

This guide will help you deploy your CRM backend to Railway for Twilio webhook support.

## Prerequisites

- GitHub account
- Railway account (https://railway.app)
- Your code pushed to GitHub repository

## Step 1: Push Code to GitHub

1. Initialize git in your project root:
```bash
git init
git add .
git commit -m "Initial CRM VoIP project setup"
```

2. Create a new repository on GitHub
3. Push your code:
```bash
git remote add origin https://github.com/yourusername/crm-voip.git
git push -u origin main
```

## Step 2: Deploy to Railway

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `crm-voip` repository
5. Railway will auto-detect the backend in the `/backend` folder

## Step 3: Configure Environment Variables

In Railway dashboard:
1. Go to your project
2. Click on the service (backend)
3. Go to "Variables" tab
4. Add these environment variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000

# Twilio Configuration (get from Twilio Console)
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_API_KEY_SID=SK1234567890abcdef...
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_TWIML_APP_SID=AP1234567890abcdef...

# This will be your Railway app URL (update after deployment)
PUBLIC_URL=https://your-app.railway.app
```

## Step 4: Update PUBLIC_URL

1. After deployment, Railway will give you a URL like: `https://your-app.railway.app`
2. Update the `PUBLIC_URL` environment variable with this URL
3. The app will automatically redeploy

## Step 5: Update Twilio Webhooks

In Twilio Console:
1. Update TwiML App webhook URL to: `https://your-app.railway.app/api/twilio/voice`
2. Update phone number webhook URL to: `https://your-app.railway.app/api/twilio/voice`

## Step 6: Test Deployment

1. Visit `https://your-app.railway.app/health` - should return OK
2. Visit `https://your-app.railway.app/` - should show API info
3. Test authentication by making a POST to `/api/auth/login`

## Step 7: Update Frontend Configuration

Update your frontend `.env` file:
```env
REACT_APP_API_URL=https://your-app.railway.app/api
```

## Deployment Commands

Railway will automatically:
1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Start the server: `npm run start`

## Monitoring

- **Logs**: View in Railway dashboard under "Deployments"
- **Health Check**: `https://your-app.railway.app/health`
- **Metrics**: Available in Railway dashboard

## Common Issues

- **Build fails**: Check TypeScript errors in logs
- **Environment variables**: Ensure all required vars are set
- **Webhook timeouts**: Verify your Railway URL is accessible
- **CORS errors**: Update FRONTEND_URL to match your frontend domain

## Production Considerations

1. **Database**: Add PostgreSQL service in Railway
2. **Redis**: Add Redis service for session management
3. **Monitoring**: Set up error tracking (Sentry, etc.)
4. **SSL**: Railway provides HTTPS by default
5. **Custom Domain**: Configure in Railway settings

## Next Steps

After successful deployment:
1. Test Twilio webhooks
2. Make test calls from dashboard
3. Monitor logs for any errors
4. Set up production database if needed