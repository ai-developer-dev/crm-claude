// Quick test script to verify Twilio credentials
require('dotenv').config();

async function testTwilioSetup() {
  console.log('🔍 Testing Twilio Configuration...\n');
  
  // Check environment variables
  const requiredVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_API_KEY_SID',
    'TWILIO_API_KEY_SECRET',
    'TWILIO_TWIML_APP_SID',
    'TWILIO_PHONE_NUMBER'
  ];
  
  console.log('📋 Environment Variables:');
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_account_sid_here' || value.includes('your_')) {
      console.log(`❌ ${varName}: Not set or placeholder`);
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`\n❌ Missing required variables: ${missingVars.join(', ')}`);
    console.log('Please update your .env file with real Twilio credentials');
    return;
  }
  
  // Test Twilio client
  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    console.log('\n🔧 Testing Twilio Client...');
    
    // Test account info
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    console.log(`✅ Account Status: ${account.status}`);
    console.log(`✅ Account Type: ${account.type}`);
    
    // Test phone number
    try {
      const phoneNumber = await client.incomingPhoneNumbers.list({
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        limit: 1
      });
      
      if (phoneNumber.length > 0) {
        console.log(`✅ Phone Number: ${phoneNumber[0].phoneNumber} (${phoneNumber[0].friendlyName})`);
      } else {
        console.log('❌ Phone Number: Not found in account');
      }
    } catch (error) {
      console.log(`❌ Phone Number Error: ${error.message}`);
    }
    
    // Test TwiML App
    try {
      const app = await client.applications(process.env.TWILIO_TWIML_APP_SID).fetch();
      console.log(`✅ TwiML App: ${app.friendlyName}`);
    } catch (error) {
      console.log(`❌ TwiML App Error: ${error.message}`);
    }
    
    // Test access token generation
    try {
      const { AccessToken } = twilio.jwt;
      const { VoiceGrant } = AccessToken;
      
      const accessToken = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        { identity: 'test-user' }
      );
      
      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: true,
      });
      
      accessToken.addGrant(voiceGrant);
      const token = accessToken.toJwt();
      
      console.log(`✅ Access Token: Generated successfully (${token.substring(0, 20)}...)`);
    } catch (error) {
      console.log(`❌ Access Token Error: ${error.message}`);
    }
    
    console.log('\n🎉 Twilio setup test completed!');
    console.log('✅ Your Twilio configuration appears to be working correctly.');
    console.log('\nNext steps:');
    console.log('1. Deploy backend to Railway');
    console.log('2. Update webhook URLs in Twilio Console');
    console.log('3. Test making calls from the dashboard');
    
  } catch (error) {
    console.log(`\n❌ Twilio Client Error: ${error.message}`);
    console.log('Please check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
  }
}

// Run the test
testTwilioSetup().catch(console.error);