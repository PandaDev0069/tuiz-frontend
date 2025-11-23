'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/services/websocket';
import { WebSocketService } from '@/services/websocket/WebSocketService';
import { cfg } from '@/config/config';
import { ConnectionEvent } from '@/services/websocket/types';

export default function WebSocketTestPage() {
  const [roomId, setRoomId] = useState('test-room-1');
  const [message, setMessage] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionEvent[]>([]);
  const [roomMessages, setRoomMessages] = useState<
    Array<{ from: string; message: unknown; timestamp: string }>
  >([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const ws = useWebSocket(cfg.apiBase, {
    onConnected: (status) => {
      addLog(`✅ Connected - Socket: ${status.socketId}, Reconnects: ${status.reconnectCount}`);
    },
    onDisconnected: (reason) => {
      addLog(`❌ Disconnected - Reason: ${reason}`);
    },
    onReconnecting: (attempt) => {
      addLog(`🔄 Reconnecting - Attempt: ${attempt}`);
    },
    onError: (error) => {
      addLog(`⚠️ Error - ${error.message}`);
    },
    onRoomJoined: (info) => {
      addLog(`🚪 Joined room ${info.roomId} (${info.clients} clients)`);
      setCurrentRoom(info.roomId);
    },
    onRoomLeft: (roomId) => {
      addLog(`👋 Left room ${roomId}`);
      setCurrentRoom(null);
    },
    onRoomMessage: (msg) => {
      addLog(`💬 Message in ${msg.roomId} from ${msg.from}`);
      setRoomMessages((prev) => [
        ...prev,
        { from: msg.from, message: msg.message, timestamp: msg.timestamp },
      ]);
    },
    onRoomUserJoined: (data) => {
      addLog(`👤 User ${data.socketId} joined ${data.roomId}`);
    },
    onRoomUserLeft: (data) => {
      addLog(`👤 User ${data.socketId} left ${data.roomId}`);
    },
    onGameAction: (action) => {
      addLog(`🎮 Game action: ${action.action} in ${action.roomId}`);
    },
    onGameState: (state) => {
      addLog(`🎮 Game state updated in ${state.roomId}`);
    },
  });

  const addLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${log}`, ...prev].slice(0, 50));
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      try {
        ws.joinRoom(roomId);
      } catch (error) {
        addLog(`❌ Failed to join room: ${error}`);
      }
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      try {
        ws.leaveRoom(currentRoom);
        setRoomMessages([]);
      } catch (error) {
        addLog(`❌ Failed to leave room: ${error}`);
      }
    }
  };

  const handleSendMessage = () => {
    if (currentRoom && message.trim()) {
      try {
        ws.sendRoomMessage(currentRoom, { text: message, type: 'chat' });
        setMessage('');
      } catch (error) {
        addLog(`❌ Failed to send message: ${error}`);
      }
    }
  };

  const handleSimulateDisconnect = () => {
    const wsService = WebSocketService.getInstance();
    wsService.simulateDisconnect();
    addLog('🔌 Simulated disconnect');
  };

  const handleClearDeviceId = () => {
    const wsService = WebSocketService.getInstance();
    wsService.clearDeviceId();
    addLog('🆔 Device ID cleared - reconnect to get new ID');
  };

  const handleRefreshHistory = () => {
    const wsService = WebSocketService.getInstance();
    setConnectionHistory(wsService.getConnectionHistory());
  };

  useEffect(() => {
    handleRefreshHistory();
    const interval = setInterval(handleRefreshHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WebSocket Test Page</h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${ws.isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className="font-medium">{ws.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <p>
              <strong>Socket ID:</strong> {ws.status.socketId || 'N/A'}
            </p>
            <p>
              <strong>Device ID:</strong> {ws.status.deviceId}
            </p>
            <p>
              <strong>Reconnect Count:</strong> {ws.status.reconnectCount}
            </p>
            <p>
              <strong>Server Time:</strong> {ws.status.serverTime || 'N/A'}
            </p>
            {ws.status.error && (
              <p className="text-red-600">
                <strong>Error:</strong> {ws.status.error}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={ws.connect}
              disabled={ws.isConnected}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
            >
              Connect
            </button>
            <button
              onClick={ws.disconnect}
              disabled={!ws.isConnected}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
            >
              Disconnect
            </button>
            <button
              onClick={ws.reconnect}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reconnect
            </button>
            <button
              onClick={handleSimulateDisconnect}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Simulate Disconnect
            </button>
            <button
              onClick={handleClearDeviceId}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Clear Device ID
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Controls */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Room Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room ID</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter room ID"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleJoinRoom}
                  disabled={!ws.isConnected || !!currentRoom}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Join Room
                </button>
                <button
                  onClick={handleLeaveRoom}
                  disabled={!currentRoom}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300"
                >
                  Leave Room
                </button>
              </div>
              {currentRoom && (
                <p className="text-sm text-gray-600">Currently in room: {currentRoom}</p>
              )}
            </div>

            {currentRoom && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Send Message</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Type a message"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Room Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Room Messages</h2>
            <div className="h-96 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded">
              {roomMessages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet</p>
              ) : (
                roomMessages.map((msg, idx) => (
                  <div key={idx} className="bg-white p-3 rounded shadow-sm">
                    <div className="text-xs text-gray-500">{msg.timestamp}</div>
                    <div className="text-sm text-gray-700">From: {msg.from}</div>
                    <div className="mt-1">{JSON.stringify(msg.message)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Logs */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Event Logs</h2>
              <button
                onClick={() => setLogs([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
            <div className="h-96 overflow-y-auto space-y-1 bg-gray-50 p-4 rounded font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center">No logs yet</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="text-gray-800">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connection History */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Connection History</h2>
              <button
                onClick={handleRefreshHistory}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            <div className="h-96 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded">
              {connectionHistory.length === 0 ? (
                <p className="text-gray-500 text-center">No history yet</p>
              ) : (
                connectionHistory.map((event, idx) => (
                  <div key={idx} className="bg-white p-2 rounded shadow-sm text-sm">
                    <span className="font-semibold">{event.type}</span> at{' '}
                    {event.timestamp.toLocaleTimeString()}
                    {event.data ? (
                      <div className="text-xs text-gray-600 mt-1">{JSON.stringify(event.data)}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">API Usage Examples</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Basic Connection</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {`import { useWebSocket } from '@/services/websocket';

const ws = useWebSocket(apiUrl, {
  onConnected: (status) => console.log('Connected', status),
  onDisconnected: (reason) => console.log('Disconnected', reason),
});

// Connect/disconnect
ws.connect();
ws.disconnect();
ws.reconnect();`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Room Management</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {`// Join a room
ws.joinRoom('room-123');

// Send a message to the room
ws.sendRoomMessage('room-123', { text: 'Hello!' });

// Leave the room
ws.leaveRoom('room-123');`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Game API</h3>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {`// Send a game action
ws.sendGameAction('room-123', 'move', { x: 10, y: 20 });

// Update game state
ws.sendGameState('room-123', { score: 100, level: 5 });`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
