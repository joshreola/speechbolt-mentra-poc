// src/App.tsx
import { useState, useEffect, useRef } from "react";

import { useSignalR } from "./hooks/use-signalR";
import ChatMessage from "./components/chat-message";

const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

function App() {
  // State to enable/disable the SignalR connection
  // We'll only enable if the necessary variables are available
  const [isSignalREnabled, setIsSignalREnabled] = useState(false); // Start disabled

  useEffect(() => {
    // Enable the connection only if both URL and Token are provided
    if (SIGNALR_HUB_URL && AUTH_TOKEN) {
      setIsSignalREnabled(true);
    } else {
      console.error(
        "SIGNALR_HUB_URL or AUTH_TOKEN is missing in environment variables."
      );
      setIsSignalREnabled(false);
    }
  }, [SIGNALR_HUB_URL, AUTH_TOKEN]); // Re-check if these values change (though they won't in a typical build)

  // Use the custom hook to manage the SignalR connection and messages
  const { messages, connectionStatus, error } = useSignalR({
    hubUrl: SIGNALR_HUB_URL, // Use variable from env
    token: AUTH_TOKEN, // Use variable from env
    enabled: isSignalREnabled, // Pass the enabled state to the hook
  });

  // Ref for the chat messages container to enable auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    // Check if the ref is current and the scroll position is near the bottom
    // This prevents auto-scrolling if the user is actively scrolling up
    const messagesElement = messagesEndRef.current?.parentElement;
    if (messagesElement) {
      const isScrolledToBottom =
        messagesElement.scrollHeight - messagesElement.clientHeight <=
        messagesElement.scrollTop + 50; // Allow for a small buffer
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Fallback if parent not found
    }
  }, [messages]); // Dependency array: run effect when messages state changes

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-8/12 bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-4rem)]">
        {" "}
        {/* Adjusted height for responsiveness */}
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-semibold">Live Transcription Chat</h1>
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
          {connectionStatus === "Disconnected" &&
            !error &&
            isSignalREnabled && (
              <p className="text-red-600">
                Disconnected. See console for errors.
              </p>
            )}
          {(!SIGNALR_HUB_URL || !AUTH_TOKEN) && (
            <p className="text-orange-600">
              Configuration missing: Please ensure VITE_SIGNALR_HUB_URL and
              VITE_AUTH_TOKEN are set in your .env file.
            </p>
          )}
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
          {/* This div helps to scroll to the latest message */}
          <div ref={messagesEndRef} />
        </div>
        {/* Footer (Optional - could add input field here if needed) */}
        {/* <div className="p-4 bg-gray-200 rounded-b-lg">
                    <p className="text-center text-gray-600 text-sm">Listening for events...</p>
                </div> */}
      </div>
    </div>
  );
}

export default App;
