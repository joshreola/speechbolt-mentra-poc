import React, { useEffect, useState } from 'react';

const WEBSOCKET_URL = 'wss://vapi-audio-relay.companies-josh-reola.workers.dev';
const TRANSCRIPT_API_URL = 'https://vapi-audio-relay.companies-josh-reola.workers.dev/transcript';

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [autoForward, setAutoForward] = useState<boolean>(false);

  useEffect(() => {
    let socket: WebSocket;

    try {
      socket = new WebSocket(WEBSOCKET_URL);

      socket.onopen = () => {
        console.log('🟢 WebSocket connected');
        setConnected(true);
        setMessages(prev => [...prev, '🟢 WebSocket connected']);
      };

      socket.onmessage = (event) => {
        console.log('📨 WebSocket message:', event.data);
        try {
          const parsed = JSON.parse(event.data);
          const stt = parsed?.data?.transcript;
          if (stt) {
            const receivedMessage = `🗣️ Received: ${stt}`;
            setMessages(prev => [...prev, receivedMessage]);
            
            // Auto-forward to Cloudflare if enabled
            if (autoForward) {
              forwardToCloudflare(stt, 'received');
            }
          }
        } catch (e) {
          console.error('❌ Error parsing WebSocket message:', e);
          setMessages(prev => [...prev, `❌ Error parsing message: ${event.data}`]);
        }
      };

      socket.onerror = (err) => {
        console.error('💥 WebSocket error:', err);
        setMessages(prev => [...prev, '💥 WebSocket error occurred']);
      };

      socket.onclose = () => {
        console.log('🔴 WebSocket closed');
        setConnected(false);
        setMessages(prev => [...prev, '🔴 WebSocket disconnected']);
      };
    } catch (err) {
      console.error('❌ Failed to connect WebSocket:', err);
      setConnected(false);
      setMessages(prev => [...prev, `❌ Failed to connect: ${err}`]);
    }

    return () => socket?.close();
  }, [autoForward]);

  // Function to forward messages to Cloudflare
  const forwardToCloudflare = async (transcript: string, speaker: string = 'user') => {
    try {
      const response = await fetch('/api/send-to-cloudflare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          speaker,
          type: speaker === 'received' ? 'auto-forward' : 'user-input',
          confidence: 0.95,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Successfully forwarded to Cloudflare:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to forward to Cloudflare:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error forwarding to Cloudflare:', error);
      return false;
    }
  };

  // Function to send user input to Cloudflare
  const sendToCloudflare = async (text: string) => {
    if (!text.trim()) return;
    
    setSending(true);
    try {
      const success = await forwardToCloudflare(text, 'user');
      
      if (success) {
        setMessages(prev => [...prev, `📤 Sent to Cloudflare: ${text}`]);
        setInputText('');
      } else {
        setMessages(prev => [...prev, `❌ Failed to send: ${text}`]);
      }
    } catch (error) {
      console.error('❌ Error sending to Cloudflare:', error);
      setMessages(prev => [...prev, `❌ Error sending: ${text}`]);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    sendToCloudflare(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const testCloudflareConnection = async () => {
    setSending(true);
    const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
    await sendToCloudflare(testMessage);
  };

  // 🕒 Fallback polling if WebSocket isn't connected
  useEffect(() => {
    if (connected) return;

    console.log('📡 Starting fallback polling...');
    const interval = setInterval(async () => {
      try {
        const res = await fetch(TRANSCRIPT_API_URL);
        const html = await res.text();
        const match = html.match(/<p>(.*?)<\/p>/);
        if (match && match[1] && !messages.some(msg => msg.includes(match[1]))) {
          setMessages(prev => [...prev, `📜 Polled: ${match[1]}`]);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => {
      console.log('🛑 Stopping fallback polling...');
      clearInterval(interval);
    };
  }, [connected, messages]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎧 Live Transcript Viewer</h1>
      
      {/* Connection Status */}
      <div style={{ 
        padding: '10px', 
        marginBottom: '20px', 
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        color: connected ? '#155724' : '#721c24'
      }}>
        <strong>Status:</strong> {connected ? '🟢 Connected (WebSocket)' : '🕒 Polling /transcript'}
      </div>

      {/* Controls */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        backgroundColor: '#f8f9fa' 
      }}>
        <h3 style={{ marginTop: 0 }}>Controls</h3>
        
        {/* Auto-forward toggle */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoForward}
              onChange={(e) => setAutoForward(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            🔄 Auto-forward received messages to Cloudflare
          </label>
        </div>

        {/* Manual message input */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message to send to Cloudflare..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !inputText.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: sending || !inputText.trim() ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: sending || !inputText.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {sending ? '📤 Sending...' : '📤 Send'}
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testCloudflareConnection}
            disabled={sending}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: sending ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            🧪 Test Cloudflare
          </button>
          <button
            onClick={clearMessages}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Clear Messages
          </button>
        </div>
      </div>

      {/* Messages Display */}
      <div style={{
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#f9f9f9',
        height: '400px',
        overflowY: 'auto',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        <h3 style={{ marginTop: 0, fontFamily: 'sans-serif' }}>Messages ({messages.length})</h3>
        {messages.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No messages yet... 
            {connected ? ' Listening for WebSocket messages.' : ' Polling for updates every 5 seconds.'}
          </p>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              style={{ 
                marginBottom: '8px', 
                padding: '8px', 
                backgroundColor: 'white', 
                borderRadius: '4px',
                borderLeft: `4px solid ${
                  msg.includes('📤') ? '#28a745' : 
                  msg.includes('❌') ? '#dc3545' : 
                  msg.includes('🟢') ? '#28a745' :
                  msg.includes('🔴') ? '#dc3545' :
                  '#007bff'
                }`
              }}
            >
              <small style={{ color: '#666' }}>[{new Date().toLocaleTimeString()}]</small> {msg}
            </div>
          ))
        )}
      </div>

      {/* Debug Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>🔧 Debug Info:</strong>
        <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
          <li>WebSocket URL: <code>{WEBSOCKET_URL}</code></li>
          <li>Polling URL: <code>{TRANSCRIPT_API_URL}</code></li>
          <li>Cloudflare API: <code>/api/send-to-cloudflare</code></li>
          <li>Auto-forward: <strong>{autoForward ? 'Enabled' : 'Disabled'}</strong></li>
          <li>Connection: <strong>{connected ? 'WebSocket' : 'Polling'}</strong></li>
        </ul>
      </div>
    </div>
  );
}
