# CRM VoIP Setup Checklist

Complete this checklist to get your CRM system working with real phone calls.

## ✅ Prerequisites Complete
- [x] Project code is working locally
- [x] Frontend runs on http://localhost:3000
- [x] Backend runs on http://localhost:5001
- [x] Authentication system working
- [x] Dashboard with drag/drop functionality

## 📞 Twilio Account Setup

### 1. Create Twilio Account
- [ ] Sign up at https://www.twilio.com/try-twilio
- [ ] Verify your phone number
- [ ] Note your free trial credits ($15)

### 2. Gather Credentials
- [ ] Copy Account SID (starts with AC...)
- [ ] Copy Auth Token from dashboard
- [ ] Create API Key (SK...) and save Secret
- [ ] Buy a phone number (+1234567890)
- [ ] Create TwiML Application (AP...)

### 3. Configure Webhooks (After Railway Deploy)
- [ ] Set TwiML App Voice URL: `https://your-app.railway.app/api/twilio/voice`
- [ ] Set Phone Number Voice URL: `https://your-app.railway.app/api/twilio/voice`

## 🚀 Railway Deployment

### 1. GitHub Setup
- [ ] Push code to GitHub repository
- [ ] Ensure backend folder structure is correct

### 2. Railway Deploy
- [ ] Create Railway account
- [ ] Deploy from GitHub repo
- [ ] Note your Railway URL (https://your-app.railway.app)

### 3. Environment Variables
- [ ] Set all Twilio credentials in Railway
- [ ] Set PUBLIC_URL to your Railway URL
- [ ] Set NODE_ENV=production

## 🔧 Configuration Updates

### 1. Update .env Files
**Backend (.env):**
```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_API_KEY_SID=SK1234567890abcdef...
TWILIO_API_KEY_SECRET=your_api_key_secret_here
TWILIO_TWIML_APP_SID=AP1234567890abcdef...
PUBLIC_URL=https://your-app.railway.app
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-app.railway.app/api
```

### 2. Test Configuration
- [ ] Run `node test-twilio.js` in backend folder
- [ ] All checks should pass ✅

## 🧪 Testing

### 1. Basic Tests
- [ ] Visit https://your-app.railway.app/health (should return OK)
- [ ] Login to dashboard works
- [ ] Call controls panel shows "Ready" status

### 2. Phone Call Tests
- [ ] Make outbound call from dashboard
- [ ] Call your Twilio number from external phone
- [ ] Answer incoming call in dashboard
- [ ] Test hold/unhold functionality
- [ ] Test hang up functionality

### 3. Advanced Tests
- [ ] Drag call to different user
- [ ] Park call in parking lot
- [ ] Transfer call between users
- [ ] Multiple simultaneous calls

## 🔍 Troubleshooting

### Common Issues
- [ ] **"Device Not Ready"**: Check API Key credentials
- [ ] **Webhook Errors**: Verify Railway URL is accessible
- [ ] **Call Fails**: Check phone number format and trial account restrictions
- [ ] **CORS Errors**: Update FRONTEND_URL in backend

### Debug Steps
1. Check Railway logs for errors
2. Verify webhook URLs in Twilio Console
3. Test API endpoints directly
4. Check browser console for JavaScript errors

## 📊 Production Readiness

### Optional Enhancements
- [ ] Set up PostgreSQL database
- [ ] Configure Redis for sessions
- [ ] Add error monitoring (Sentry)
- [ ] Set up custom domain
- [ ] Add SSL certificates
- [ ] Configure logging and monitoring

### Performance Optimizations
- [ ] Enable call recording
- [ ] Set up call analytics
- [ ] Configure call queues
- [ ] Add IVR system
- [ ] Implement call routing rules

## 🎯 Success Criteria

Your system is fully working when:
- ✅ You can make outbound calls from the dashboard
- ✅ External calls to your Twilio number ring in the dashboard
- ✅ You can answer, hold, and hang up calls
- ✅ Drag/drop call management works
- ✅ Multiple users can handle calls simultaneously
- ✅ Call status updates in real-time

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Verify all Twilio webhook URLs
4. Test with Twilio's debug tools
5. Check browser console for frontend errors

**Estimated Setup Time: 30-45 minutes**

---

*Once complete, you'll have a fully functional business-grade CRM with VoIP capabilities!*