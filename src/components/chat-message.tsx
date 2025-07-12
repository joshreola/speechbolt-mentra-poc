// src/components/ChatMessage.tsx
import React from "react";
import type { ChatMessage as MessageType } from "../types"; // Import the type
import UserAvatar from "./user-avatar";
import AIAvatar from "./ai-avatar";

interface ChatMessageProps {
  message: MessageType; // It takes ONE message object as a prop
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isCaller = message.sender === "caller";
  const messageClasses = isCaller
    ? "bg-blue-500 text-white self-start rounded-br-xl" // Caller: blue, left, specific rounding
    : "bg-gray-300 text-gray-800 self-end rounded-bl-xl"; // AI: gray, right, specific rounding

  // Basic timestamp formatting (optional, adjust locale/options as needed)
  // Parse the ISO 8601 timestamp string
  const messageDate = new Date(message.timestamp);
  // Use 'en-US' locale and basic options for consistency with the image
  const messageTime = messageDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    // Container for the message bubble and timestamp
    // mb-3: margin-bottom between messages
    // max-w-[80%]: limit bubble width
    // self-start/self-end: align bubble within flex column
    // items-start/items-end: align timestamp within the message's column container
    <div
      className={`flex flex-col mb-3 max-w-[80%] ${
        isCaller ? "items-start self-start" : "items-end self-end"
      }`}
    >
      {/* Message Content Container - includes avatar for caller */}
      <div
        className={`flex items-end gap-2 ${
          isCaller ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* User Avatar - only for caller messages */}
        <div className="w-8 h-8 flex-shrink-0">
          {isCaller ? (
            <UserAvatar size={32} className="mb-1" />
          ) : (
            <AIAvatar size={32} className="mb-1" />
          )}
        </div>

        {/* Message Bubble */}
        {/* p-3: padding inside bubble */}
        {/* rounded-xl: rounded corners, except one specific corner */}
        {/* messageClasses: dynamic background color and specific corner rounding */}
        {/* shadow-sm: small shadow */}
        <div className={`p-3 rounded-xl ${messageClasses} shadow-sm`}>
          {/* Message Text Container */}
          {/* text-sm: small font size */}
          {/* break-words: break long words to prevent overflow */}
          {/* whitespace-pre-wrap: preserve whitespace and wrap text */}
          <p className="text-sm break-words whitespace-pre-wrap">
            {/* Add the sender label here */}
            <span
              className={`font-semibold mr-1 ${
                isCaller ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {isCaller ? "" : "AI:"}
            </span>
            {message.text}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <span
        className={`text-xs text-gray-500 mt-1 ${
          isCaller ? "text-left ml-10" : "text-right"
        }`}
      >
        {messageTime}
      </span>
    </div>
  );
};

export default ChatMessage;
