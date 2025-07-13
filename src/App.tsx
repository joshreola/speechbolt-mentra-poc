import React, { useEffect, useState } from 'react';

const WEBSOCKET_URL = 'wss://vapi-audio-relay.companies-josh-reola.workers.dev';
const TRANSCRIPT_API_URL = 'https://vapi-audio-relay.companies-josh-reola.workers.dev/transcript';

export default function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    let socket: WebSocket;

    try {
      socket = new WebSocket(WEBSOCKET_URL);

      socket.onopen = () => {
        console.log('🟢 WebSocket connected');
        setConnected(true);
      };

      socket.onmessage = (event) => {
        console.log('📨 WebSocket message:', event.data);
        try {
          const parsed = JSON.parse(event.data);
          const stt = parsed?.data?.transcript;
          if (stt) {
            setMessages(prev => [...prev, `🗣️ ${stt}`]);
          }
        } catch (e) {
          console.error('❌ Error parsing WebSocket message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('💥 WebSocket error:', err);
      };

      socket.onclose = () => {
        console.log('🔴 WebSocket closed');
        setConnected(false);
      };
    } catch (err) {
      console.error('❌ Failed to connect WebSocket:', err);
      setConnected(false);
    }

    return () => socket?.close();
  }, []);

  // 🕒 Fallback polling if WebSocket isn't connected
  useEffect(() => {
    if (connected) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(TRANSCRIPT_API_URL);
        const html = await res.text();
        const match = html.match(/<p>(.*?)<\/p>/);
        if (match && match[1] && !messages.includes(match[1])) {
          setMessages(prev => [...prev, `📜 ${match[1]}`]);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [connected, messages]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎧 Live Transcript Viewer</h1>
      <p>Status: {connected ? '🟢 Connected (WebSocket)' : '🕒 Polling /transcript'}</p>

      <div style={{
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#f9f9f9',
        height: '300px',
        overflowY: 'auto'
      }}>
        {messages.length === 0 ? (
          <p>No messages yet...</p>
        ) : (
          messages.map((msg, i) => <div key={i}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
