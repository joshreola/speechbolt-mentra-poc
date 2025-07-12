import { useEffect, useRef } from "react";

import type { ChatMessage as ChatMessageType } from "./types";
import "./index.css";
import ChatMessage from "./components/chat-message";

// --- Dummy Data for UI Preview ---
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 📨 Send dummy transcript to Cloudflare Worker
  useEffect(() => {
    const sendTranscriptToWorker = async () => {
      const transcript = DUMMY_MESSAGES.map((msg) => `[${msg.sender}]: ${msg.text}`).join("\n");

      try {
        const response = await fetch("https://vapi-audio-relay.YOUR_SUBDOMAIN.workers.dev/transcript", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcript }),
        });

        const data = await response.json();
        console.log("✅ Worker response:", data);
      } catch (err) {
        console.error("❌ Error sending transcript to worker:", err);
      }
    };

    sendTranscriptToWorker();
  }, []);

  const sortedDummyMessages = [...DUMMY_MESSAGES].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-8/12 bg-white rounded-lg shadow-xl flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]">
        <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-semibold">
            Transcription Chat Preview
          </h1>
          <span className="text-sm font-medium text-yellow-300">
            Status: Dummy Data
          </span>
        </div>

        <div className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar flex flex-col">
          {sortedDummyMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>No dummy messages to display.</p>
            </div>
          ) : (
            sortedDummyMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 bg-gray-200 rounded-b-lg text-center text-xs text-gray-600">
          Displaying UI for chat with Xolero AI in speechbolt
        </div>
      </div>
    </div>
  );
}

export default App;
