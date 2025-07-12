// src/types.ts

// The structure of the data payload within the message
interface TranscriptionData {
  timestamp: string; // ISO 8601 string
  message: string;
}

// The expected format of the message received from SignalR events
export interface SignalRMessage {
  type: string; // e.g., "call.input_audio.transcription.completed"
  data: TranscriptionData;
}

// The structure we'll use to store messages in our component state
export interface ChatMessage {
  id: string; // Unique ID for React keys
  sender: "caller" | "ai"; // To distinguish who sent the message
  timestamp: string; // Original timestamp for sorting
  text: string; // The actual transcription message
}
