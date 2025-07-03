# Twilio Account Setup Guide

This guide will walk you through setting up a Twilio account for your CRM VoIP system.

## 1. Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your phone number
4. You'll get $15 in free credits to start

## 2. Get Account Credentials

After signing up, you'll need these credentials:

### Account SID and Auth Token
1. Go to https://console.twilio.com/
2. On the dashboard, you'll see:
   - **Account SID**: Starts with "AC..." (e.g., AC1234567890abcdef...)
   - **Auth Token**: Click "Show" to reveal it

### API Keys (Required for Voice SDK)
1. Go to https://console.twilio.com/project/api-keys
2. Click "Create API Key"
3. Choose "Standard" key type
4. Give it a name like "CRM VoIP API Key"
5. Save both:
   - **API Key SID**: Starts with "SK..."
   - **API Key Secret**: Long string, save this securely!

## 3. Buy a Phone Number

1. Go to https://console.twilio.com/develop/phone-numbers/manage/incoming
2. Click "Buy a number"
3. Choose your country (US recommended for testing)
4. Select "Voice" capability
5. Choose a number you like
6. Click "Buy" (costs ~$1/month)

## 4. Create TwiML Application

1. Go to https://console.twilio.com/develop/voice/manage/twiml-apps
2. Click "Create new TwiML App"
3. Set these values:
   - **Friendly Name**: "CRM VoIP App"
   - **Voice Request URL**: `https://your-app.railway.app/api/twilio/voice`
   - **Voice Request Method**: POST
   - **Status Callback URL**: `https://your-app.railway.app/api/twilio/call-status`
   - **Status Callback Method**: POST
4. Click "Create"
5. Save the **Application SID** (starts with "AP...")

## 5. Configure Phone Number Webhook

1. Go to https://console.twilio.com/develop/phone-numbers/manage/incoming
2. Click on your phone number
3. In the "Voice" section:
   - **Webhook**: `https://your-app.railway.app/api/twilio/voice`
   - **HTTP Method**: POST
4. Click "Save"

## 6. Update Environment Variables

Update your `.env` file with the real credentials:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_API_KEY_SID=SK1234567890abcdef...
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_TWIML_APP_SID=AP1234567890abcdef...

# Public URL for webhooks (Railway deployment URL)
PUBLIC_URL=https://your-app.railway.app
```

## 7. Test Your Setup

Once configured, you can:
- Make outbound calls from the dashboard
- Receive calls to your Twilio number
- See call status updates in real-time

## Important Notes

- **Free Trial**: You can only call verified numbers during trial
- **Upgrade**: To call any number, upgrade your account
- **Costs**: Outbound calls ~$0.02/minute, inbound calls ~$0.01/minute
- **Webhooks**: Must be publicly accessible (Railway deployment required)

## Troubleshooting

- **Webhook errors**: Ensure your Railway app is deployed and accessible
- **Token errors**: Double-check API Key SID and Secret
- **Call failures**: Verify phone number format (+1234567890)
- **Permission errors**: Upgrade from trial to make unrestricted calls

## Next Steps

After setup:
1. Deploy backend to Railway
2. Test making calls from dashboard
3. Test receiving calls to your Twilio number
4. Implement advanced features (transfer, parking, etc.)