import { DashboardUser, Call, ParkingSlot } from '../types/dashboard';

export const mockUsers: DashboardUser[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@company.com',
    extension: '101',
    is_active: true,
    status: 'available',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    extension: '102',
    is_active: true,
    status: 'on-call',
    currentCall: {
      id: 'call-1',
      from: '+1234567890',
      to: '102',
      status: 'connected',
      startTime: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: 'inbound'
    }
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@company.com',
    extension: '103',
    is_active: true,
    status: 'busy',
  },
  {
    id: '4',
    name: 'Lisa Wilson',
    email: 'lisa@company.com',
    extension: '104',
    is_active: true,
    status: 'away',
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@company.com',
    extension: '105',
    is_active: false,
    status: 'offline',
  },
  {
    id: '6',
    name: 'Emily Taylor',
    email: 'emily@company.com',
    extension: '106',
    is_active: true,
    status: 'available',
  },
  {
    id: '7',
    name: 'Chris Anderson',
    email: 'chris@company.com',
    extension: '107',
    is_active: true,
    status: 'on-call',
    currentCall: {
      id: 'call-2',
      from: '107',
      to: '+0987654321',
      status: 'connected',
      startTime: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      type: 'outbound'
    }
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jennifer@company.com',
    extension: '108',
    is_active: true,
    status: 'available',
  }
];

export const mockParkingSlots: ParkingSlot[] = [
  {
    id: 'park-1',
    number: 1,
    isOccupied: false,
  },
  {
    id: 'park-2',
    number: 2,
    isOccupied: true,
    call: {
      id: 'call-3',
      from: '+1122334455',
      to: 'parked',
      status: 'parked',
      startTime: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
      type: 'inbound'
    }
  },
  {
    id: 'park-3',
    number: 3,
    isOccupied: false,
  },
  {
    id: 'park-4',
    number: 4,
    isOccupied: false,
  },
  {
    id: 'park-5',
    number: 5,
    isOccupied: false,
  },
  {
    id: 'park-6',
    number: 6,
    isOccupied: false,
  }
];

export const incomingCalls: Call[] = [
  {
    id: 'incoming-1',
    from: '+1555123456',
    to: 'queue',
    status: 'ringing',
    startTime: new Date(),
    type: 'inbound'
  },
  {
    id: 'incoming-2',
    from: '+1555987654',
    to: 'queue',
    status: 'ringing',
    startTime: new Date(Date.now() - 30 * 1000), // 30 seconds ago
    type: 'inbound'
  }
];