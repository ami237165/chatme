import { GetPresignedUrlDTO } from "@/interfaces/meseage_related/messageInterFace";
import { store } from "@/store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ProgressCallback = (progress: number) => void;

function getAuthHeaders(): Record<string, string> {
  const token = store.getState().auth.access_token;
  const mobile:any = store.getState().auth.currentMobile;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (mobile) headers["x-user-id"] = mobile;
  return headers;
}
export async function getPresignedUrl(payload:{objectName: string,
  expires?: number}):Promise<any>{
    console.log("hwhghd",payload);
    
  const res = await fetch(`${API_BASE}uploads/getpresignedputurl`,{
    method:'POST',
    headers:{
    "Content-Type": "application/json",
  },
    body:JSON.stringify({
      objectName:payload.objectName,
      expires:payload.expires
    }),
  })
  return await res.json()
}

export function uploadMediaFile(
  res:string,
  file: File,
  fileId: string,
  messageId: string,
  roomId: string,
  objectKey: string,
  onProgress?: ProgressCallback,
): Promise<{ objectKey: string; fileId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileId", fileId);
    formData.append("messageId", messageId);
    formData.append("roomId", roomId);
    const start = performance.now();

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || !onProgress) return;
      console.log("event.total :",event.total);
       console.log({
    loaded: event.loaded,
    total: event.total,
    speed:
      event.loaded / ((performance.now() - start) / 1000) / 1024 / 1024,
  });
      onProgress(Math.round((event.loaded / event.total) * 100));
    });
    
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log("comes in ststus",xhr.status);
        
        // MinIO returns an empty body on success — nothing to parse.
        resolve({ objectKey, fileId });
        return;
      }    
      console.log("Upload failed with status ${xhr.status}");
        
      reject(new Error(`Upload failed with status ${xhr.status}`));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT",res);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    // const headers = getAuthHeaders();
    // Object.entries(headers).forEach(([key, value]) => {
    //   xhr.setRequestHeader(key, value);
    // });
    xhr.send(file);
  });
}

export async function completeMessageUpload(payload: {
  messageId: string;
  roomId: string;
  sender: string;
  receiver: string;
  text?: string | null;
  hasText: boolean;
  timestamp: number;
  files: Array<{
    fileId: string;
    fileName: string;
    fileType: string;
    objectKey: string;
  }>;
}) {
  const response = await fetch(`${API_BASE}uploads/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...payload,
      timestamp: String(payload.timestamp),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to complete upload");
  }

  return response.json();
}

export async function downloadMediaFile(
  objectKey: string,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const response = await fetch(`${API_BASE}uploads/${encodeURIComponent(objectKey)}`, {
    headers: getAuthHeaders(),
  });
  console.log("objeckt key:",objectKey);
  
  if (!response.ok) {
    throw new Error("Download failed");
  }

  const contentLength = Number(response.headers.get("Content-Length") || 0);
  const reader = response.body?.getReader();

  if (!reader) {
    return response.blob();
  }

  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.length;
      if (contentLength > 0 && onProgress) {
        onProgress(Math.round((received / contentLength) * 100));
      }
    }
  }

  const blob = new Blob(chunks, {
    type: response.headers.get("Content-Type") || "application/octet-stream",
  });

  if (onProgress) onProgress(100);
  return blob;
}
