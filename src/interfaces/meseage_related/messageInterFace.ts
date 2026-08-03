export interface FileAttachment {
  fileName: string;
  fileType: string;
  fileId: string;
  objectName:string;
  objectKey?: string;
  uploadProgress?: number;
  downloadProgress?: number;
  fileData?: File;
  previewUrl?: string;
}

export interface MessageData {
  id: string;
  sender: string;
  receiver: string;
  text?: string | null;
  hasText: boolean;
  files?: FileAttachment[];
  hasFiles: boolean;
  isUploading?: boolean;
  isRead?: boolean;
  isSent?: boolean;
  timestamp: any;
  roomId: string;
  delivered?: boolean;
}

export interface GetPresignedUrlDTO {  
  objectName: string;
  expires?: number;
  respHeaders?: any | Date;
  requestDate?: Date;
}
