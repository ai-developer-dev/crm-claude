import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { UserCard } from '../components/dashboard/UserCard';
import { ParkingLot } from '../components/dashboard/ParkingLot';
import { IncomingCalls } from '../components/dashboard/IncomingCalls';
import { CallControls } from '../components/calling/CallControls';
import { useAuth } from '../contexts/AuthContext';
import { useTwilio } from '../contexts/TwilioContext';
import { DashboardUser, Call, ParkingSlot } from '../types/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Dashboard: React.FC = () => {
  const { user: currentUser, logout, token } = useAuth();
  const { 
    isReady: twilioReady, 
    error: twilioError, 
    isConnected: isTwilioConnected,
    callStartTime,
    callDirection,
    callPhoneNumber
  } = useTwilio();
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [incomingCallsQueue, setIncomingCallsQueue] = useState<Call[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
    initializeParkingSlots();
  }, []);

  // Update current user's call status when Twilio call state changes
  useEffect(() => {
    if (currentUser && users.length > 0) {
      setUsers(prev => prev.map(user => {
        if (user.email === currentUser.email) {
          if (isTwilioConnected && callStartTime && callDirection && callPhoneNumber) {
            return {
              ...user,
              status: 'on-call',
              currentCall: {
                id: `twilio-${Date.now()}`,
                type: callDirection,
                from: callDirection === 'inbound' ? callPhoneNumber : currentUser.extension,
                to: callDirection === 'inbound' ? currentUser.extension : callPhoneNumber,
                startTime: callStartTime,
                status: 'connected'
              }
            };
          } else {
            return {
              ...user,
              status: 'available',
              currentCall: undefined
            };
          }
        }
        return user;
      }));
    }
  }, [currentUser, users.length, isTwilioConnected, callStartTime, callDirection, callPhoneNumber]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Convert API users to DashboardUser format
        const dashboardUsers: DashboardUser[] = data.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          extension: user.extension,
          status: user.is_active ? 'available' : 'offline',
          currentCall: undefined,
        }));
        setUsers(dashboardUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeParkingSlots = () => {
    // Create parking slots 1-6
    const slots: ParkingSlot[] = Array.from({ length: 6 }, (_, i) => ({
      id: `parking-${i + 1}`,
      number: i + 1,
      isOccupied: false,
      call: undefined,
    }));
    setParkingSlots(slots);
  };

  // Grid layout configuration
  const layouts = {
    lg: [
      { i: 'call-controls', x: 0, y: 0, w: 3, h: 8, minW: 3, minH: 6 },
      { i: 'incoming-calls', x: 3, y: 0, w: 3, h: 8, minW: 3, minH: 6 },
      { i: 'parking-lot', x: 6, y: 0, w: 6, h: 8, minW: 4, minH: 6 },
      { i: 'users-grid', x: 0, y: 8, w: 12, h: 12, minW: 8, minH: 8 },
    ],
    md: [
      { i: 'call-controls', x: 0, y: 0, w: 4, h: 8, minW: 3, minH: 6 },
      { i: 'incoming-calls', x: 4, y: 0, w: 4, h: 8, minW: 3, minH: 6 },
      { i: 'parking-lot', x: 8, y: 0, w: 4, h: 8, minW: 3, minH: 6 },
      { i: 'users-grid', x: 0, y: 8, w: 12, h: 12, minW: 8, minH: 8 },
    ],
    sm: [
      { i: 'call-controls', x: 0, y: 0, w: 6, h: 8 },
      { i: 'incoming-calls', x: 0, y: 8, w: 6, h: 6 },
      { i: 'parking-lot', x: 0, y: 14, w: 6, h: 6 },
      { i: 'users-grid', x: 0, y: 20, w: 6, h: 12 },
    ],
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle call to user assignment
    if (activeData?.type === 'call' && overData?.type === 'user') {
      const call = activeData.call as Call;
      const userId = overData.userId as string;
      
      console.log(`Assigning call ${call.id} to user ${userId}`);
      
      // Remove from incoming calls
      setIncomingCallsQueue(prev => prev.filter(c => c.id !== call.id));
      
      // Assign to user
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              status: 'on-call', 
              currentCall: { 
                ...call, 
                to: user.extension,
                status: 'connected'
              } 
            }
          : user
      ));
    }

    // Handle call to parking
    if (activeData?.type === 'call' && overData?.type === 'parking') {
      const call = activeData.call as Call;
      
      console.log(`Parking call ${call.id}`);
      
      // Find empty parking slot
      const emptySlot = parkingSlots.find(slot => !slot.isOccupied);
      if (emptySlot) {
        // Remove from incoming calls
        setIncomingCallsQueue(prev => prev.filter(c => c.id !== call.id));
        
        // Add to parking
        setParkingSlots(prev => prev.map(slot =>
          slot.id === emptySlot.id
            ? {
                ...slot,
                isOccupied: true,
                call: { ...call, status: 'parked' }
              }
            : slot
        ));
      }
    }

    // Handle user to user call transfer
    if (activeData?.type === 'user' && overData?.type === 'user') {
      const fromUser = activeData.user as DashboardUser;
      const toUserId = overData.userId as string;
      
      if (fromUser.currentCall && fromUser.id !== toUserId) {
        console.log(`Transferring call from ${fromUser.id} to ${toUserId}`);
        
        // Remove call from source user
        setUsers(prev => prev.map(user =>
          user.id === fromUser.id
            ? { ...user, status: 'available', currentCall: undefined }
            : user.id === toUserId
            ? { 
                ...user, 
                status: 'on-call',
                currentCall: {
                  ...fromUser.currentCall!,
                  to: user.extension
                }
              }
            : user
        ));
      }
    }
  };

  const handleAnswerCall = (callId: string) => {
    const call = incomingCallsQueue.find(c => c.id === callId);
    if (call && currentUser) {
      console.log(`Answering call ${callId}`);
      
      // Remove from incoming calls
      setIncomingCallsQueue(prev => prev.filter(c => c.id !== callId));
      
      // Assign to current user (in a real app, this would be handled by the backend)
      setUsers(prev => prev.map(user =>
        user.email === currentUser.email
          ? {
              ...user,
              status: 'on-call',
              currentCall: {
                ...call,
                to: user.extension,
                status: 'connected'
              }
            }
          : user
      ));
    }
  };

  const handleRejectCall = (callId: string) => {
    console.log(`Rejecting call ${callId}`);
    setIncomingCallsQueue(prev => prev.filter(c => c.id !== callId));
  };

  const handleUnpark = (slotId: string, userId: string) => {
    const slot = parkingSlots.find(s => s.id === slotId);
    if (slot?.call) {
      console.log(`Unparking call from slot ${slotId} to user ${userId}`);
      
      // Remove from parking
      setParkingSlots(prev => prev.map(s =>
        s.id === slotId
          ? { ...s, isOccupied: false, call: undefined }
          : s
      ));
      
      // Assign to user (in real app, would assign to current user or specified user)
      if (currentUser) {
        setUsers(prev => prev.map(user =>
          user.email === currentUser.email
            ? {
                ...user,
                status: 'on-call',
                currentCall: {
                  ...slot.call!,
                  status: 'connected'
                }
              }
            : user
        ));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome back, {currentUser?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">
                  {users.filter(u => u.status === 'available').length} available
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm text-gray-600">
                  {users.filter(u => u.status === 'on-call').length} on calls
                </span>
              </div>
              <button
                onClick={() => window.location.href = '/settings'}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Settings
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={true}
            isResizable={true}
          >
            {/* Call Controls */}
            <div key="call-controls">
              <CallControls />
            </div>

            {/* Incoming Calls */}
            <div key="incoming-calls">
              <IncomingCalls
                calls={incomingCallsQueue}
                onAnswerCall={handleAnswerCall}
                onRejectCall={handleRejectCall}
              />
            </div>

            {/* Parking Lot */}
            <div key="parking-lot">
              <ParkingLot
                slots={parkingSlots}
                onUnpark={handleUnpark}
              />
            </div>

            {/* Users Grid */}
            <div key="users-grid">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Team</h2>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading users...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users found.</p>
                    <button
                      onClick={() => window.location.href = '/settings'}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Add users in Settings
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onAcceptCall={(callId, userId) => console.log('Accept call', callId, userId)}
                        onTransferCall={(callId, fromUserId, toUserId) => 
                          console.log('Transfer call', callId, fromUserId, toUserId)
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResponsiveGridLayout>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                {activeId.startsWith('user-') && (
                  <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-blue-300">
                    Dragging user...
                  </div>
                )}
                {activeId.startsWith('call-') && (
                  <div className="bg-yellow-50 rounded-lg shadow-lg p-4 border-2 border-yellow-300">
                    Dragging call...
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};