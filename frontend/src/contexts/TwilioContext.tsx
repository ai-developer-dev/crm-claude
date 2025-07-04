import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Device } from '@twilio/voice-sdk';
import { useAuth } from './AuthContext';

interface TwilioContextType {
  device: Device | null;
  isReady: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  currentCall: any | null;
  incomingCall: any | null;
  error: string | null;
  callStartTime: Date | null;
  callDirection: 'inbound' | 'outbound' | null;
  callPhoneNumber: string | null;
  makeCall: (phoneNumber: string) => Promise<void>;
  answerCall: () => void;
  rejectCall: () => void;
  hangupCall: () => void;
  holdCall: () => void;
  unHoldCall: () => void;
  clearError: () => void;
}

const TwilioContext = createContext<TwilioContextType | undefined>(undefined);

interface TwilioProviderProps {
  children: ReactNode;
}

export const TwilioProvider: React.FC<TwilioProviderProps> = ({ children }) => {
  const { token: authToken } = useAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState<any | null>(null);
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDirection, setCallDirection] = useState<'inbound' | 'outbound' | null>(null);
  const [callPhoneNumber, setCallPhoneNumber] = useState<string | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  // Initialize Twilio Device
  const initializeDevice = useCallback(async () => {
    if (!authToken) return;

    try {
      setError(null);
      
      // Get Twilio access token from backend
      const response = await fetch(`${API_BASE_URL}/twilio/token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Twilio access token');
      }

      const { token: twilioToken } = await response.json();

      // Create Twilio Device
      const newDevice = new Device(twilioToken, {
        logLevel: 'info',
        sounds: {
          incoming: '/sounds/incoming.mp3', // You'll need to add sound files
          outgoing: '/sounds/outgoing.mp3',
          disconnect: '/sounds/disconnect.mp3',
        },
      });

      // Device event listeners
      newDevice.on('ready', () => {
        console.log('Twilio Device is ready');
        setIsReady(true);
        setError(null);
      });

      newDevice.on('error', (error) => {
        console.error('Twilio Device error:', error);
        setError(error.message || 'Device error occurred');
        setIsReady(false);
      });

      newDevice.on('incoming', (call) => {
        console.log('Incoming call:', call.parameters);
        setIncomingCall(call);
        setCallDirection('inbound');
        setCallPhoneNumber(call.parameters?.From || 'Unknown');
        
        // Set up call event listeners
        setupCallEventListeners(call);
      });

      newDevice.on('destroy', () => {
        console.log('Twilio Device destroyed');
        setIsReady(false);
        setDevice(null);
      });

      // Register the device
      await newDevice.register();
      setDevice(newDevice);

    } catch (error) {
      console.error('Error initializing Twilio Device:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize device');
    }
  }, [authToken, API_BASE_URL]);

  // Set up call event listeners
  const setupCallEventListeners = (call: any) => {
    call.on('accept', () => {
      console.log('Call accepted');
      setIsConnected(true);
      setIsConnecting(false);
      setCurrentCall(call);
      setIncomingCall(null);
      setCallStartTime(new Date());
    });

    call.on('disconnect', () => {
      console.log('Call disconnected');
      setIsConnected(false);
      setIsConnecting(false);
      setCurrentCall(null);
      setIncomingCall(null);
      setCallStartTime(null);
      setCallDirection(null);
      setCallPhoneNumber(null);
    });

    call.on('reject', () => {
      console.log('Call rejected');
      setIncomingCall(null);
    });

    call.on('error', (error: any) => {
      console.error('Call error:', error);
      setError(error.message || 'Call error occurred');
      setIsConnecting(false);
      setIsConnected(false);
    });
  };

  // Make outbound call
  const makeCall = async (phoneNumber: string) => {
    if (!device || !isReady) {
      setError('Device not ready');
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      setCallDirection('outbound');
      setCallPhoneNumber(phoneNumber);

      const call = await device.connect({
        params: {
          To: phoneNumber,
        },
      });

      console.log('Outbound call initiated:', call);
      setupCallEventListeners(call);

    } catch (error) {
      console.error('Error making call:', error);
      setError(error instanceof Error ? error.message : 'Failed to make call');
      setIsConnecting(false);
    }
  };

  // Answer incoming call
  const answerCall = () => {
    if (incomingCall) {
      console.log('Answering call with parameters:', incomingCall.parameters);
      incomingCall.accept();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
    }
  };

  // Hangup current call
  const hangupCall = () => {
    if (currentCall) {
      console.log('Hanging up call:', currentCall);
      currentCall.disconnect();
    } else if (incomingCall) {
      console.log('Rejecting incoming call:', incomingCall);
      incomingCall.reject();
    } else {
      console.log('No call to hang up');
    }
  };

  // Hold current call
  const holdCall = () => {
    if (currentCall) {
      currentCall.mute(true);
    }
  };

  // Unhold current call
  const unHoldCall = () => {
    if (currentCall) {
      currentCall.mute(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Initialize device when auth token is available
  useEffect(() => {
    if (authToken && !device) {
      initializeDevice();
    }
  }, [authToken, device, initializeDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [device]);

  const value = {
    device,
    isReady,
    isConnecting,
    isConnected,
    currentCall,
    incomingCall,
    error,
    callStartTime,
    callDirection,
    callPhoneNumber,
    makeCall,
    answerCall,
    rejectCall,
    hangupCall,
    holdCall,
    unHoldCall,
    clearError,
  };

  return <TwilioContext.Provider value={value}>{children}</TwilioContext.Provider>;
};

export const useTwilio = () => {
  const context = useContext(TwilioContext);
  if (context === undefined) {
    throw new Error('useTwilio must be used within a TwilioProvider');
  }
  return context;
};