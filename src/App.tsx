// src/App.tsx
import { useEffect, useRef } from "react";

import type { ChatMessage as ChatMessageType } from "./types"; // Import the type for the dummy data
import "./index.css"; // Ensure Tailwind CSS is imported
import ChatMessage from "./components/chat-message";

// --- Dummy Data for UI Preview ---
// This data directly matches the structure needed by ChatMessage
const DUMMY_MESSAGES: ChatMessageType[] = [
  {
    id: "dummy-1",
    sender: "caller",
    timestamp: "2025-06-06T12:00:00Z",
    text: "Hello, I'm the caller speaking first. This is dummy message 1.",
  },
  {
    id: "dummy-2",
    sender: "ai",
    timestamp: "2025-06-06T12:00:05Z",
    text: "Okay, I hear you. This is dummy AI response 1.",
  },
  {
    id: "dummy-3",
    sender: "caller",
    timestamp: "2025-06-06T12:00:10Z",
    text: "Testing a slightly longer dummy message to see how it wraps within the bubble. Let's add a bit more text here to fill it up and make it multi-line.",
  },
  {
    id: "dummy-4",
    sender: "ai",
    timestamp: "2025-06-06T12:00:18Z",
    text: "Acknowledged. Processing your input. This dummy AI message also demonstrates wrapping capabilities for longer text.",
  },
  {
    id: "dummy-5",
    sender: "caller",
    timestamp: "2025-06-06T12:00:25Z",
    text: "Another test message from the caller. Just filling space with some more text.",
  },
  {
    id: "dummy-6",
    sender: "ai",
    timestamp: "2025-06-06T12:00:30Z",
    text: "Final dummy AI response to complete the example data set. Hopefully this is enough to show the scrolling.",
  },
  {
    id: "dummy-7",
    sender: "caller",
    timestamp: "2025-06-06T12:00:35Z",
    text: "One more short one.",
  },
  {
    id: "dummy-8",
    sender: "ai",
    timestamp: "2025-06-06T12:00:40Z",
    text: "And the absolute last dummy message.",
  },
];
// -------------------------------------------

function App() {
  // Ref for auto-scrolling (optional for static data, but shows the scroll behavior)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom on initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Small delay to ensure rendering happens first
    return () => clearTimeout(timer); // Clean up timer
  }, []); // Empty dependency array means this runs only once

  // Sort dummy messages by timestamp for correct display order
  const sortedDummyMessages = [...DUMMY_MESSAGES].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    // Main container for the page layout
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      {/* Chat Box Container */}
      {/* Responsive height calc(100vh - margin) */}
      <div className="w-full max-w-8/12 bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-semibold">
            Transcription Chat Preview
          </h1>
          <span className="text-sm font-medium text-yellow-300">
            Status: Dummy Data
          </span>
        </div>

        {/* Messages Display Area */}
        {/* flex-1: takes remaining vertical space */}
        {/* overflow-y-auto: enables vertical scrolling */}
        {/* custom-scrollbar: applies our custom scrollbar styles */}
        {/* flex flex-col: stacks message bubbles vertically */}
        <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar flex flex-col">
          {sortedDummyMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>No dummy messages to display.</p>
            </div>
          ) : (
            // Map over the sorted dummy data
            sortedDummyMessages.map((message) => (
              // Pass each message object as a prop to ChatMessage
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          {/* Empty div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-200 rounded-b-lg text-center text-xs text-gray-600">
          Displaying UI for chat with Xolero AI in speechbolt
        </div>
      </div>
    </div>
  );
}

export default App;
