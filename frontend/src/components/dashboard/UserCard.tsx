import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { DashboardUser, Call } from '../../types/dashboard';

interface UserCardProps {
  user: DashboardUser;
  onAcceptCall?: (callId: string, userId: string) => void;
  onTransferCall?: (callId: string, fromUserId: string, toUserId: string) => void;
}

const statusColors = {
  available: 'bg-green-500',
  busy: 'bg-yellow-500',
  away: 'bg-orange-500',
  offline: 'bg-gray-500',
  'on-call': 'bg-blue-500',
};

const statusLabels = {
  available: 'Available',
  busy: 'Busy',
  away: 'Away',
  offline: 'Offline',
  'on-call': 'On Call',
};

export const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onAcceptCall, 
  onTransferCall 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `user-${user.id}`,
    data: {
      type: 'user',
      user,
    },
  });

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: `user-drop-${user.id}`,
    data: {
      type: 'user',
      userId: user.id,
    },
  });

  const formatCallDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const cardStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setDroppableRef}
      className={`relative ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div
        ref={setDraggableRef}
        style={cardStyle}
        {...listeners}
        {...attributes}
        className={`
          bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 cursor-move
          ${isDragging ? 'opacity-50 shadow-lg scale-105' : 'hover:shadow-lg'}
          ${isOver ? 'border-blue-300' : 'border-gray-200'}
          ${!user.is_active ? 'opacity-75' : ''}
        `}
      >
        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${statusColors[user.status]}`} />
            <span className="text-sm text-gray-600">{statusLabels[user.status]}</span>
          </div>
          <span className="text-xs text-gray-500 font-mono">Ext. {user.extension}</span>
        </div>

        {/* User Info */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
        </div>

        {/* Current Call Info */}
        {user.currentCall && (
          <div className="bg-blue-50 rounded-md p-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-800">
                {user.currentCall.type === 'inbound' ? '📞 Inbound' : '📞 Outbound'}
              </span>
              <span className="text-xs text-blue-600 font-mono">
                {formatCallDuration(user.currentCall.startTime)}
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {user.currentCall.type === 'inbound' 
                ? `From: ${user.currentCall.from}`
                : `To: ${user.currentCall.to}`
              }
            </div>
            <div className="flex space-x-2 mt-2">
              <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded">
                Hold
              </button>
              <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded">
                End
              </button>
            </div>
          </div>
        )}

        {/* Incoming Call Indicator */}
        {user.status === 'available' && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">📞</span>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center">
            <span className="text-blue-600 font-medium">Transfer Here</span>
          </div>
        )}
      </div>
    </div>
  );
};