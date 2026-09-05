import { GetPresignedUrlDTO } from "@/interfaces/meseage_related/messageInterFace";
import { store } from "@/store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ProgressCallback = (progress: number) => void;

function getAuthHeaders(): Record<string, string> {
  const token = store.getState().auth.access_token;
  const mobile: any = store.getState().auth.currentMobile;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (mobile) headers["x-user-id"] = mobile;
  return headers;
}

export async function getPresignedPutUrl(payload: {
  objectName: string;
  expires?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE}uploads/getpresignedputurl`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      objectName: payload.objectName,
      expires: payload.expires,
    }),
  });
  return await res.json();
}

/** @deprecated use getPresignedPutUrl */
export const getPresignedUrl = getPresignedPutUrl;

export async function getPresignedDownloadUrl(
  objectName: string,
  expires = 300,
): Promise<string> {
  const response = await fetch(`${API_BASE}uploads/getpresignedurl`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ objectName, expires }),
  });

  if (!response.ok) {
    throw new Error("Failed to get presigned download URL");
  }

  const json = await response.json();
  const url =
    typeof json.data === "string"
      ? json.data
      : json.data?.url ?? json.data?.presignedUrl;

  if (!url) {
    throw new Error("Presigned download URL missing in response");
  }

  return url;
}

async function fetchBlobWithProgress(
  url: string,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const response = await fetch(url);

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

export function uploadMediaFile(
  res: string,
  file: File,
  fileId: string,
  messageId: string,
  roomId: string,
  objectKey: string,
  onProgress?: ProgressCallback,
): Promise<{ objectKey: string; fileId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const start = performance.now();

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable || !onProgress) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ objectKey, fileId });
        return;
      }
      reject(new Error(`Upload failed with status ${xhr.status}`));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", res);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
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
  timestamp: string;
  files: Array<{
    fileId: string;
    fileName: string;
    fileType: string;
    objectKey: string;
    objectName?: string;
  }>;
}) {
  const response = await fetch(`${API_BASE}uploads/complete`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...payload,
      timestamp: payload.timestamp,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to complete upload");
  }

  return response.json();
}

export async function downloadMediaFile(
  objectName: string,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  const presignedUrl = await getPresignedDownloadUrl(objectName);
  return fetchBlobWithProgress(presignedUrl, onProgress);
}
