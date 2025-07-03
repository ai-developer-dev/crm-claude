import React, { useState } from 'react';
import { useTwilio } from '../../contexts/TwilioContext';

export const CallControls: React.FC = () => {
  const {
    isReady,
    isConnecting,
    isConnected,
    currentCall,
    incomingCall,
    error,
    makeCall,
    answerCall,
    rejectCall,
    hangupCall,
    holdCall,
    unHoldCall,
    clearError,
  } = useTwilio();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOnHold, setIsOnHold] = useState(false);

  const handleMakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      await makeCall(phoneNumber.trim());
    }
  };

  const handleHold = () => {
    if (isOnHold) {
      unHoldCall();
      setIsOnHold(false);
    } else {
      holdCall();
      setIsOnHold(true);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numeric = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (numeric.length >= 6) {
      return `(${numeric.slice(0, 3)}) ${numeric.slice(3, 6)}-${numeric.slice(6, 10)}`;
    } else if (numeric.length >= 3) {
      return `(${numeric.slice(0, 3)}) ${numeric.slice(3)}`;
    } else {
      return numeric;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Call Controls</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isReady ? 'Ready' : 'Not Ready'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={clearError}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-800">Incoming Call</h3>
              <p className="text-sm text-yellow-600">
                From: {incomingCall.parameters?.From || 'Unknown'}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={answerCall}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Answer
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Call Display */}
      {(isConnecting || isConnected) && (
        <div className="mb-4 bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-800">
                {isConnecting ? 'Connecting...' : 'Connected'}
              </h3>
              {currentCall && (
                <p className="text-sm text-blue-600">
                  {currentCall.parameters?.To || phoneNumber}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              {isConnected && (
                <>
                  <button
                    onClick={handleHold}
                    className={`px-3 py-1 rounded text-sm ${
                      isOnHold
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {isOnHold ? 'Unhold' : 'Hold'}
                  </button>
                  <button
                    onClick={hangupCall}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Hang Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Make Call Form */}
      {!isConnecting && !isConnected && !incomingCall && (
        <form onSubmit={handleMakeCall} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="(555) 123-4567"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={!isReady}
              maxLength={14}
            />
          </div>
          <button
            type="submit"
            disabled={!isReady || !phoneNumber.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
          >
            {!isReady ? 'Device Not Ready' : 'Make Call'}
          </button>
        </form>
      )}

      {/* Device Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Device Status: {isReady ? 'Ready' : 'Not Ready'}</div>
          <div>Call Status: {
            isConnected ? 'Connected' : 
            isConnecting ? 'Connecting' : 
            incomingCall ? 'Incoming Call' : 
            'Idle'
          }</div>
        </div>
      </div>
    </div>
  );
};