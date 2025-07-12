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

  // 📨 Send dummy transcripts to Cloudflare Worker in proper Vapi format
  useEffect(() => {
    const sendTranscriptsToWorker = async () => {
      console.log('🚀 Starting to send dummy messages to Vapi Worker...');
      
      // Send conversation start event
      try {
        await fetch("https://vapi-audio-relay.companies-josh-reola.workers.dev", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "conversation-started",
            timestamp: new Date().toISOString()
          }),
        });
        console.log('✅ Sent conversation-started event');
      } catch (err) {
        console.error("❌ Error sending conversation-started:", err);
      }

      // Wait 2 seconds before starting messages
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Send each message as separate transcript events
      for (let i = 0; i < DUMMY_MESSAGES.length; i++) {
        const msg = DUMMY_MESSAGES[i];
        
        try {
          // Send speech-started event for more realism
          await fetch("https://vapi-audio-relay.companies-josh-reola.workers.dev", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "speech-started",
              timestamp: new Date().toISOString()
            }),
          });

          // Wait a moment
          await new Promise(resolve => setTimeout(resolve, 500));

          // Send the actual transcript
          const response = await fetch("https://vapi-audio-relay.companies-josh-reola.workers.dev", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "transcript",
              transcript: msg.text,
              speaker: msg.sender === "caller" ? "user" : "assistant",
              confidence: Math.random() * 0.2 + 0.8, // Random confidence between 0.8-1.0
              timestamp: msg.timestamp,
              isFinal: true
            }),
          });

          if (response.ok) {
            console.log(`✅ Sent message ${i + 1}/${DUMMY_MESSAGES.length}: ${msg.text.substring(0, 30)}...`);
          } else {
            console.error(`❌ Failed to send message ${i + 1}:`, response.status);
          }

          // Send speech-ended event
          await fetch("https://vapi-audio-relay.companies-josh-reola.workers.dev", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "speech-ended",
              timestamp: new Date().toISOString()
            }),
          });
          
          // Wait between messages to simulate real conversation
          const delay = Math.random() * 2000 + 1000; // Random delay 1-3 seconds
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (err) {
          console.error(`❌ Error sending message ${i + 1}:`, err);
        }
      }

      // Send conversation end event
      try {
        await fetch("https://vapi-audio-relay.companies-josh-reola.workers.dev", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "conversation-ended",
            timestamp: new Date().toISOString()
          }),
        });
        console.log('✅ Sent conversation-ended event');
        console.log('🎉 All dummy messages sent successfully!');
      } catch (err) {
        console.error("❌ Error sending conversation-ended:", err);
      }
    };

    // Start sending messages after 3 seconds (give time for page to load)
    const timer = setTimeout(sendTranscriptsToWorker, 3000);
    return () => clearTimeout(timer);
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
            Status: Sending to Vapi Worker
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
          Sending dummy chat data to Vapi Worker → MentraOS Glasses
        </div>

        <div className="p-3 bg-blue-50 border-t">
          <div className="text-xs text-blue-800">
            <strong>📡 Pipeline Status:</strong>
            <div className="mt-1">
              React App → Cloudflare Worker → MentraOS Glasses
            </div>
            <div className="mt-1 text-blue-600">
              Check browser console for sending status and your glasses for messages!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
