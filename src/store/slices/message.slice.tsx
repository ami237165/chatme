import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface FileAttachment {
  fileName: string;
  fileType: string;
  fileId: string;
  objectName:string;
  objectKey?: string;
  uploadProgress?: number;
  downloadProgress?: number;
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
  timestamp: string;
  roomId: string;
  delivered?:boolean;
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
      action: PayloadAction<{ roomId: string; message: MessageData }>,
    ) {
      const { roomId, message } = action.payload;
      if (!state[roomId]) {
        state[roomId] = [];
      }
      // 🚨 If msg already exists → ignore
      if (state[roomId].some((m) => m.id === message.id)) {
        return;
      }
      state[roomId].push(message);
    },
    updateMessage(
      state,
      action: PayloadAction<{
        roomId: string;
        messageId: string;
        updates: Partial<MessageData>;
      }>,
    ) {
      const { roomId, messageId, updates } = action.payload;

      const message = state[roomId]?.find((m) => m.id === messageId);

      if (!message) return;

      Object.assign(message, updates);
    },
    updateFileProgress(
      state,
      action: PayloadAction<{
        roomId: string;
        messageId: string;
        fileId: string;
        uploadProgress?: number;
        objectKey?: string;
      }>,
    ) {
      const { roomId, messageId, fileId, uploadProgress, objectKey } =
        action.payload;
      const message = state[roomId]?.find((m) => m.id === messageId);
      const file = message?.files?.find((f) => f.fileId === fileId);
      if (!file) return;
      if (uploadProgress !== undefined) file.uploadProgress = uploadProgress;
      if (objectKey) file.objectKey = objectKey;
    },
    clearMessages(state) {
      return initialState; // resets to empty object {}
    },
  },
});
export const { addMessage, clearMessages, updateMessage, updateFileProgress } =
  messageSlice.actions;
export default messageSlice.reducer;
