export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  extension: string;
  is_active: boolean;
  status: UserStatus;
  currentCall?: Call;
  profileImage?: string;
}

export interface Call {
  id: string;
  from: string;
  to: string;
  status: CallStatus;
  startTime: Date;
  duration?: number;
  type: 'inbound' | 'outbound';
}

export interface ParkingSlot {
  id: string;
  number: number;
  call?: Call;
  isOccupied: boolean;
}

export type UserStatus = 'available' | 'busy' | 'away' | 'offline' | 'on-call';

export type CallStatus = 
  | 'ringing'
  | 'connected'
  | 'hold'
  | 'parked'
  | 'transferring'
  | 'ended';

export interface DragData {
  type: 'call' | 'user';
  id: string;
  data: Call | DashboardUser;
}

export interface DropZone {
  type: 'user' | 'parking' | 'transfer';
  id: string;
}