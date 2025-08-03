import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface FileAttachment {
  fileName: string;
  fileType: string;
  fileId: string;// base64 or blob URL
}
interface MessageData {
  id: string;
  sender: string;
  receiver: string;
  // Text message support
  text?: string | null;
  hasText: boolean;

  // File message support
  files?: FileAttachment[];
  hasFiles: boolean;

  // UI related flags (optional/future)
  isUploading?: boolean;
  isRead?: boolean;
  isSent?: boolean;
  // Timestamps
  timestamp: number;
  roomId: string;
}
interface Conversations {
  [roomId: string]: MessageData[];
}
const initialState: Conversations = {};
const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    addMessage(
      state,
      action: PayloadAction<{ roomId: string; message: MessageData }>
    ) {
      const { roomId, message } = action.payload;
      if (!state[roomId]) {
        state[roomId] = [];
      }
      state[roomId].push(message);
    },
  },
});
export const { addMessage } = messageSlice.actions;
export default messageSlice.reducer;
