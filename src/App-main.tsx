// src/App-main.tsx
import { useState, useEffect, useRef } from "react";
import { useSignalR } from "./hooks/use-signalR";
import ChatMessage from "./components/chat-message";

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

function App() {
  // State to enable/disable the SignalR connection
  const [isSignalREnabled, setIsSignalREnabled] = useState(false);
  
  // Send functionality state
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [autoForward, setAutoForward] = useState<boolean>(false);

  useEffect(() => {
    if (SIGNALR_HUB_URL && AUTH_TOKEN) {
      setIsSignalREnabled(true);
    } else {
      console.error("SIGNALR_HUB_URL or AUTH_TOKEN is missing in environment variables.");
      setIsSignalREnabled(false);
    }
  }, [SIGNALR_HUB_URL, AUTH_TOKEN]);

  // Use the custom hook to manage the SignalR connection and messages
  const { messages, connectionStatus, error } = useSignalR({
    hubUrl: SIGNALR_HUB_URL,
    token: AUTH_TOKEN,
    enabled: isSignalREnabled,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    const messagesElement = messagesEndRef.current?.parentElement;
    if (messagesElement) {
      const isScrolledToBottom =
        messagesElement.scrollHeight - messagesElement.clientHeight <=
        messagesElement.scrollTop + 50;
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto-forward new messages to Cloudflare
  useEffect(() => {
    if (autoForward && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      // Only forward if it's a new message (simple check)
      forwardToCloudflare(latestMessage.text, latestMessage.sender);
    }
  }, [messages, autoForward]);

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
          speaker: speaker === 'caller' ? 'user' : 'ai',
          type: 'signalr-forward',
          confidence: 0.95,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Successfully forwarded to Cloudflare:', transcript);
        return true;
      } else {
        console.error('❌ Failed to forward to Cloudflare:', response.status);
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
        console.log(`📤 Sent to Cloudflare: ${text}`);
        setInputText('');
        // Optionally show a success message in the UI
      } else {
        console.error(`❌ Failed to send: ${text}`);
      }
    } catch (error) {
      console.error('❌ Error sending to Cloudflare:', error);
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

  const testCloudflareConnection = async () => {
    setSending(true);
    const testMessage = `SignalR test message at ${new Date().toLocaleTimeString()}`;
    await sendToCloudflare(testMessage);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-4rem)]">
        
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-semibold">Live Transcription Chat (SignalR)</h1>
          <span
            className={`text-sm font-medium ${
              connectionStatus === "Connected"
                ? "text-green-300"
                : connectionStatus === "Connecting"
                ? "text-yellow-300"
                : "text-red-300"
            }`}
          >
            Status: {connectionStatus}
          </span>
        </div>

        {/* Connection Status/Error Area */}
        <div className="p-2 text-center text-sm">
          {error && <p className="text-red-500">{error}</p>}
          {connectionStatus === "Connecting" && (
            <p className="text-yellow-600">Attempting to connect...</p>
          )}
          {connectionStatus === "Disconnected" && !error && isSignalREnabled && (
            <p className="text-red-600">Disconnected. See console for errors.</p>
          )}
          {(!SIGNALR_HUB_URL || !AUTH_TOKEN) && (
            <p className="text-orange-600">
              Configuration missing: Please ensure VITE_SIGNALR_HUB_URL and
              VITE_AUTH_TOKEN are set in your .env file.
            </p>
          )}
        </div>

        {/* Send Controls */}
        <div className="p-4 bg-gray-50 border-b">
          {/* Auto-forward toggle */}
          <div className="mb-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoForward}
                onChange={(e) => setAutoForward(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">🔄 Auto-forward messages to Cloudflare</span>
            </label>
          </div>

          {/* Manual message input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message to send to Cloudflare..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={sending || !inputText.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? '📤 Sending...' : '📤 Send'}
            </button>
          </div>

          {/* Test button */}
          <button
            onClick={testCloudflareConnection}
            disabled={sending}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
          >
            🧪 Test Cloudflare
          </button>
        </div>

        {/* Messages Display Area */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
          {messages.length === 0 &&
          connectionStatus !== "Connecting" &&
          SIGNALR_HUB_URL &&
          AUTH_TOKEN ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Waiting for transcriptions...</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer with debug info */}
        <div className="p-2 bg-gray-100 text-xs text-gray-600 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span>
              Auto-forward: <strong>{autoForward ? 'ON' : 'OFF'}</strong>
            </span>
            <span>
              Messages: <strong>{messages.length}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
