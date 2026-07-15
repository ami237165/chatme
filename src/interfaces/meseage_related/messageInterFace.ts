export interface FileAttachment {
    fileName: string;
    fileType: string;
    fileData?:any;
    fileId: string; // base64 or blob URL
    previewUrl?:any
  }

export  interface MessageData {
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
    delivered?: boolean;
  }