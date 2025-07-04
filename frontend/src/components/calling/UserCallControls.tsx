import React, { useState, useEffect } from 'react';
import { useTwilio } from '../../contexts/TwilioContext';

interface UserCallControlsProps {
  callStartTime: Date;
  callDirection: 'inbound' | 'outbound';
  phoneNumber: string;
}

export const UserCallControls: React.FC<UserCallControlsProps> = ({
  callStartTime,
  callDirection,
  phoneNumber
}) => {
  const { hangupCall, holdCall, unHoldCall } = useTwilio();
  const [isOnHold, setIsOnHold] = useState(false);
  const [callDuration, setCallDuration] = useState('0:00');

  // Update call duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - callStartTime.getTime()) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setCallDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStartTime]);

  const handleHold = () => {
    if (isOnHold) {
      unHoldCall();
      setIsOnHold(false);
    } else {
      holdCall();
      setIsOnHold(true);
    }
  };

  return (
    <div className="bg-blue-50 rounded-md p-3 mt-3 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-800">
          {callDirection === 'inbound' ? '📞 Incoming Call' : '📞 Outgoing Call'}
        </span>
        <span className="text-xs text-blue-600 font-mono font-bold">
          {callDuration}
        </span>
      </div>
      
      <div className="text-sm text-blue-700 mb-3">
        {callDirection === 'inbound' 
          ? `From: ${phoneNumber}`
          : `To: ${phoneNumber}`
        }
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={handleHold}
          className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
            isOnHold
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          {isOnHold ? '🔊 Unhold' : '🔇 Hold'}
        </button>
        
        <button 
          onClick={hangupCall}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-md border border-red-300 font-medium transition-colors"
        >
          📞 Hang Up
        </button>
      </div>
      
      {isOnHold && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
          Call is on hold
        </div>
      )}
    </div>
  );
};