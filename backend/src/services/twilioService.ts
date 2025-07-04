import twilio from 'twilio';
const { AccessToken } = twilio.jwt;
const { VoiceGrant } = AccessToken;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid = process.env.TWILIO_API_KEY_SID;
const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
const twimlAppSid = process.env.TWILIO_TWIML_APP_SID;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client only if credentials are available
const client = (accountSid && authToken && accountSid !== 'your_account_sid_here') 
  ? twilio(accountSid, authToken) 
  : null;

export class TwilioService {
  /**
   * Generate access token for Twilio Voice JavaScript SDK
   */
  static generateAccessToken(identity: string): string {
    console.log('Environment check:', {
      accountSid: accountSid ? `${accountSid.substring(0, 6)}...` : 'undefined',
      authToken: authToken ? 'set' : 'undefined',
      nodeEnv: process.env.NODE_ENV,
      allTwilioVars: {
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? 'set' : 'undefined',
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? 'set' : 'undefined',
        TWILIO_API_KEY_SID: process.env.TWILIO_API_KEY_SID ? 'set' : 'undefined',
        TWILIO_API_KEY_SECRET: process.env.TWILIO_API_KEY_SECRET ? 'set' : 'undefined',
        TWILIO_TWIML_APP_SID: process.env.TWILIO_TWIML_APP_SID ? 'set' : 'undefined'
      }
    });
    
    if (!accountSid || !authToken || accountSid === 'your_account_sid_here') {
      throw new Error('Twilio Account SID and Auth Token must be configured');
    }

    if (!apiKeySid || !apiKeySecret) {
      throw new Error('Twilio API Key SID and Secret must be configured');
    }

    if (!twimlAppSid) {
      throw new Error('Twilio TwiML Application SID must be configured');
    }

    // Sanitize identity to only contain valid characters (alphanumeric and underscore)
    const sanitizedIdentity = identity.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 121);

    try {
      // Create access token with proper API credentials
      const accessToken = new AccessToken(
        accountSid,
        apiKeySid,
        apiKeySecret,
        { 
          identity: sanitizedIdentity,
          ttl: 3600 // 1 hour expiration
        }
      );

      // Create Voice grant with proper TwiML Application SID
      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true,
      });

      accessToken.addGrant(voiceGrant);

      return accessToken.toJwt();
    } catch (error) {
      console.error('Error generating Twilio access token:', error);
      throw new Error('Failed to generate access token: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Make an outbound call
   */
  static async makeCall(fromUserId: string, toNumber: string, callbackUrl: string) {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const call = await client.calls.create({
        from: twilioPhoneNumber!,
        to: toNumber,
        url: callbackUrl,
        statusCallback: `${process.env.PUBLIC_URL}/api/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST',
        record: false, // Can be enabled for call recording
      });

      return {
        success: true,
        callSid: call.sid,
        status: call.status,
        from: call.from,
        to: call.to,
      };
    } catch (error) {
      console.error('Error making call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get call details
   */
  static async getCall(callSid: string) {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const call = await client.calls(callSid).fetch();
      return {
        success: true,
        call: {
          sid: call.sid,
          status: call.status,
          from: call.from,
          to: call.to,
          startTime: call.startTime,
          endTime: call.endTime,
          duration: call.duration,
          price: call.price,
          direction: call.direction,
        },
      };
    } catch (error) {
      console.error('Error fetching call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update call (hold, unhold, etc.)
   */
  static async updateCall(callSid: string, updates: { url?: string; method?: string; status?: 'completed' | 'canceled' }) {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const call = await client.calls(callSid).update(updates as any);
      return {
        success: true,
        call: {
          sid: call.sid,
          status: call.status,
          from: call.from,
          to: call.to,
        },
      };
    } catch (error) {
      console.error('Error updating call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * End/hangup call
   */
  static async hangupCall(callSid: string) {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const call = await client.calls(callSid).update({ status: 'completed' });
      return {
        success: true,
        call: {
          sid: call.sid,
          status: call.status,
        },
      };
    } catch (error) {
      console.error('Error hanging up call:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create conference for multi-party calls
   */
  static async createConference(friendlyName: string) {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const conference = await (client.conferences as any).create({
        friendlyName,
        statusCallback: `${process.env.PUBLIC_URL}/api/twilio/conference-status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['start', 'end', 'join', 'leave'],
      } as any);

      return {
        success: true,
        conference: {
          sid: conference.sid,
          friendlyName: conference.friendlyName,
          status: conference.status,
        },
      };
    } catch (error) {
      console.error('Error creating conference:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of active calls
   */
  static async getActiveCalls() {
    if (!client) {
      return { success: false, error: 'Twilio not configured' };
    }
    try {
      const calls = await client.calls.list({
        status: 'in-progress' as any,
        limit: 100,
      });

      return {
        success: true,
        calls: calls.map(call => ({
          sid: call.sid,
          status: call.status,
          from: call.from,
          to: call.to,
          startTime: call.startTime,
          direction: call.direction,
        })),
      };
    } catch (error) {
      console.error('Error fetching active calls:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate TwiML for incoming calls
   */
  static generateIncomingCallTwiML(userExtension?: string) {
    const twiml = new twilio.twiml.VoiceResponse();

    if (userExtension) {
      // Route to specific user
      const dial = twiml.dial({
        callerId: twilioPhoneNumber,
        timeout: 30,
      });
      dial.client(userExtension);
    } else {
      // Route to queue or IVR
      twiml.say('Please wait while we connect you to an available representative.');
      twiml.enqueue('support');
    }

    return twiml.toString();
  }

  /**
   * Generate TwiML for outbound calls
   */
  static generateOutboundCallTwiML(toNumber: string, fromUserExtension: string) {
    const twiml = new twilio.twiml.VoiceResponse();
    
    const dial = twiml.dial({
      callerId: twilioPhoneNumber,
      timeout: 30,
    });
    
    dial.number(toNumber);

    return twiml.toString();
  }
}