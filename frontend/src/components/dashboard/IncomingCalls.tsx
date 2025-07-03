import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Call } from '../../types/dashboard';

interface IncomingCallsProps {
  calls: Call[];
  onAnswerCall?: (callId: string) => void;
  onRejectCall?: (callId: string) => void;
}

export const IncomingCalls: React.FC<IncomingCallsProps> = ({ 
  calls, 
  onAnswerCall, 
  onRejectCall 
}) => {
  const formatCallDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Incoming Calls</h2>
        <span className="text-sm text-gray-500">{calls.length} waiting</span>
      </div>

      <div className="space-y-3">
        {calls.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📞</div>
            <p>No incoming calls</p>
          </div>
        ) : (
          calls.map((call) => (
            <IncomingCallCard 
              key={call.id} 
              call={call} 
              onAnswerCall={onAnswerCall}
              onRejectCall={onRejectCall}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface IncomingCallCardProps {
  call: Call;
  onAnswerCall?: (callId: string) => void;
  onRejectCall?: (callId: string) => void;
}

const IncomingCallCard: React.FC<IncomingCallCardProps> = ({ 
  call, 
  onAnswerCall, 
  onRejectCall 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `call-${call.id}`,
    data: {
      type: 'call',
      call,
    },
  });

  const formatCallDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${duration}s`;
  };

  const cardStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      {...listeners}
      {...attributes}
      className={`
        bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 cursor-move transition-all
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-md'}
        animate-pulse
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
          <span className="text-sm font-medium text-yellow-800">Incoming Call</span>
        </div>
        <span className="text-xs text-yellow-600 font-mono">
          {formatCallDuration(call.startTime)}
        </span>
      </div>

      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-900">
          {call.from}
        </div>
        <div className="text-xs text-gray-600">
          Waiting to be answered
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAnswerCall && onAnswerCall(call.id);
          }}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded-md transition-colors"
        >
          ✓ Answer
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRejectCall && onRejectCall(call.id);
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-2 px-3 rounded-md transition-colors"
        >
          ✗ Decline
        </button>
      </div>

      <div className="mt-2 text-xs text-yellow-700 text-center">
        Drag to assign to user
      </div>
    </div>
  );
};