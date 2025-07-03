import express from 'express';
import { TwilioService } from '../services/twilioService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Generate access token for Twilio Voice SDK
router.get('/token', authenticateToken, async (req: any, res: any) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Use user email or ID as Twilio identity
    const identity = user.email || user.userId;
    const token = TwilioService.generateAccessToken(identity);

    res.json({
      token,
      identity,
    });
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    res.status(500).json({ 
      error: 'Failed to generate access token',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook for incoming calls
router.post('/voice', async (req: any, res: any) => {
  try {
    const { From, To, CallSid } = req.body;
    
    console.log('Incoming call:', { From, To, CallSid });

    // For now, route all incoming calls to queue
    // In production, you might route based on dialed number or IVR
    const twiml = TwilioService.generateIncomingCallTwiML();
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error handling incoming call:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Webhook for call status updates
router.post('/call-status', async (req: any, res: any) => {
  try {
    const { CallSid, CallStatus, From, To, Direction } = req.body;
    
    console.log('Call status update:', {
      CallSid,
      CallStatus,
      From,
      To,
      Direction,
    });

    // Here you would typically update your database with call status
    // and broadcast updates to connected dashboard clients via Socket.io
    
    // For now, just log the status
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling call status:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Webhook for conference status
router.post('/conference-status', async (req: any, res: any) => {
  try {
    const { ConferenceSid, StatusCallbackEvent, FriendlyName } = req.body;
    
    console.log('Conference status update:', {
      ConferenceSid,
      StatusCallbackEvent,
      FriendlyName,
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling conference status:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Queue music for waiting callers
router.post('/queue-music', async (req: any, res: any) => {
  try {
    const twiml = new (require('twilio').twiml.VoiceResponse)();
    
    // Play hold music
    twiml.play('http://com.twilio.music.classical.s3.amazonaws.com/BusyStrings.wav');
    
    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error generating queue music:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Make outbound call
router.post('/make-call', authenticateToken, async (req: any, res: any) => {
  try {
    const { toNumber } = req.body;
    const user = req.user;

    if (!toNumber) {
      res.status(400).json({ error: 'Phone number is required' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Generate TwiML URL for the call
    const callbackUrl = `${process.env.PUBLIC_URL}/api/twilio/outbound-call?user=${user.userId}&to=${encodeURIComponent(toNumber)}`;

    const result = await TwilioService.makeCall(user.userId, toNumber, callbackUrl);

    if (result.success) {
      res.json({
        success: true,
        callSid: result.callSid,
        status: result.status,
        message: 'Call initiated successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ 
      error: 'Failed to make call',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// TwiML for outbound calls
router.post('/outbound-call', async (req: any, res: any) => {
  try {
    const { user: userId, to: toNumber } = req.query;
    
    console.log('Outbound call TwiML request:', { userId, toNumber });

    const twiml = TwilioService.generateOutboundCallTwiML(toNumber, userId);
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error generating outbound call TwiML:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Hangup call
router.post('/hangup/:callSid', authenticateToken, async (req: any, res: any) => {
  try {
    const { callSid } = req.params;

    const result = await TwilioService.hangupCall(callSid);

    if (result.success) {
      res.json({
        success: true,
        message: 'Call ended successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error hanging up call:', error);
    res.status(500).json({ 
      error: 'Failed to end call',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get call details
router.get('/call/:callSid', authenticateToken, async (req: any, res: any) => {
  try {
    const { callSid } = req.params;

    const result = await TwilioService.getCall(callSid);

    if (result.success) {
      res.json(result.call);
    } else {
      res.status(404).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({ 
      error: 'Failed to fetch call details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get active calls
router.get('/calls/active', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await TwilioService.getActiveCalls();

    if (result.success) {
      res.json({
        calls: result.calls,
      });
    } else {
      res.status(500).json({
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error fetching active calls:', error);
    res.status(500).json({ 
      error: 'Failed to fetch active calls',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;