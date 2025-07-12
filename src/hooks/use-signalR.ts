import { useState, useEffect, useRef, useMemo } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import type { ChatMessage, SignalRMessage } from "../types";

interface UseSignalRProps {
  hubUrl: string;
  token: string | null; // Accept token, can be null initially
  enabled: boolean; // Control when to start the connection
}

interface UseSignalRReturn {
  messages: ChatMessage[];
  connectionStatus: "Disconnected" | "Connecting" | "Connected";
  error: string | null;
}

const CALL_CONNECT_EVENT = "call.connected";
const CALL_DISCONNECT_EVENT = "call.disconnected";
const CALLER_EVENT = "call.input_audio.transcription.completed";
const AI_EVENT = "call.output_audio.transcription.completed";

export const useSignalR = ({
  hubUrl,
  token,
  enabled,
}: UseSignalRProps): UseSignalRReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "Disconnected" | "Connecting" | "Connected"
  >("Disconnected");
  const [error, setError] = useState<string | null>(null);

  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!enabled || !hubUrl || !token) {
      if (connectionRef.current) {
        // If disabled and connection exists, stop it
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionStatus("Disconnected");
      }
      if (!token && enabled) {
        setError("Authentication token is missing.");
      } else {
        setError(null); // Clear error if disabled or token becomes available
      }
      return;
    }

    setError(null); // Clear previous errors
    setConnectionStatus("Connecting");

    // Build the connection with the token
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token, // Provide the token for authentication
      })
      .configureLogging(LogLevel.Information) // Configure logging level
      .withAutomaticReconnect() // Enable automatic reconnects
      .build();

    // Event handlers for connection status
    connection
      .start()
      .then(() => {
        console.info("SignalR Connected.");
        setConnectionStatus("Connected");
      })
      .catch((err) => {
        console.error("SignalR Connection Error: ", err);
        setError(`Connection failed: ${err.message}`);
        setConnectionStatus("Disconnected");
      });

    connection.onclose((error) => {
      console.info("SignalR Connection Closed:", error);
      setConnectionStatus("Disconnected");
      if (error) {
        setError(`Connection closed due to error: ${error.message}`);
      } else {
        setError(null); // Clear error if connection closes gracefully (e.g., manual stop)
      }
    });

    connection.onreconnecting((error) => {
      console.info("SignalR Reconnecting:", error);
      setConnectionStatus("Connecting");
      if (error) {
        setError(`Reconnecting due to error: ${error.message}`);
      }
    });

    connection.onreconnected((connectionId) => {
      console.info("SignalR Reconnected. ConnectionId:", connectionId);
      setConnectionStatus("Connected");
      setError(null); // Clear error on successful reconnection
    });

    const handleNewMessage = (message: SignalRMessage) => {
      console.log(message);

      // Only process transcription events
      if (
        [CALLER_EVENT, AI_EVENT, CALL_DISCONNECT_EVENT].includes(message.type)
      ) {
        switch (message.type) {
          case CALLER_EVENT:
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: `${Date.now()}-${Math.random()}`, // Simple unique ID
                sender: "caller",
                timestamp: message.data.timestamp,
                text: message.data.message,
              },
            ]);
            break;
          case AI_EVENT:
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: `${Date.now()}-${Math.random()}`, // Simple unique ID
                sender: "ai",
                timestamp: message.data.timestamp,
                text: message.data.message,
              },
            ]);
            break;
          case CALL_DISCONNECT_EVENT:
            setMessages([]);
            break;
        }
      }
      // Ignore other event types silently
    };

    connection.on("receivemessage", (_, message: string) => {
      handleNewMessage(JSON.parse(message));
    });

    // Store the connection in the ref
    connectionRef.current = connection;

    // Cleanup function: Stop the connection when the component unmounts or dependencies change
    return () => {
      console.info("SignalR Disconnecting...");
      connection
        .stop()
        .then(() => console.info("SignalR Connection Stopped."))
        .catch((err) =>
          console.error("Error stopping SignalR connection:", err)
        );
      connectionRef.current = null;
      setConnectionStatus("Disconnected");
      setMessages([]); // Clear messages on disconnect/cleanup
    };
  }, [hubUrl, token, enabled]); // Re-run effect if hubUrl, token, or enabled changes

  // Sort messages by timestamp before returning
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages]);

  return { messages: sortedMessages, connectionStatus, error };
};
