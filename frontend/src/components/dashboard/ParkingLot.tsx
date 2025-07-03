import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ParkingSlot } from '../../types/dashboard';

interface ParkingLotProps {
  slots: ParkingSlot[];
  onUnpark?: (slotId: string, userId: string) => void;
}

export const ParkingLot: React.FC<ParkingLotProps> = ({ slots, onUnpark }) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: 'parking-lot',
    data: {
      type: 'parking',
    },
  });

  const formatCallDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Call Parking</h2>
        <span className="text-sm text-gray-500">
          {slots.filter(s => s.isOccupied).length}/{slots.length} occupied
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`
          grid grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-lg border-2 border-dashed transition-all
          ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
        `}
      >
        {slots.map((slot) => (
          <ParkingSlotCard key={slot.id} slot={slot} onUnpark={onUnpark} />
        ))}
      </div>

      {isOver && (
        <div className="mt-2 text-center text-blue-600 font-medium">
          Drop call here to park
        </div>
      )}
    </div>
  );
};

interface ParkingSlotCardProps {
  slot: ParkingSlot;
  onUnpark?: (slotId: string, userId: string) => void;
}

const ParkingSlotCard: React.FC<ParkingSlotCardProps> = ({ slot, onUnpark }) => {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `parking-slot-${slot.id}`,
    data: {
      type: 'parking-slot',
      slotId: slot.id,
    },
  });

  const formatCallDuration = (startTime: Date) => {
    const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      className={`
        relative border-2 rounded-lg p-3 min-h-[80px] transition-all
        ${slot.isOccupied 
          ? 'border-red-300 bg-red-50' 
          : isOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        }
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Slot {slot.number}</span>
        {slot.isOccupied && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {slot.isOccupied && slot.call ? (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            From: {slot.call.from}
          </div>
          <div className="text-xs font-mono text-red-600">
            {formatCallDuration(slot.call.startTime)}
          </div>
          <div className="flex space-x-1">
            <button 
              className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
              onClick={() => onUnpark && onUnpark(slot.id, 'current-user')}
            >
              Unpark
            </button>
            <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-1 rounded">
              End
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-gray-400">Empty</span>
        </div>
      )}

      {isOver && !slot.isOccupied && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center">
          <span className="text-blue-600 text-xs font-medium">Park Here</span>
        </div>
      )}
    </div>
  );
};