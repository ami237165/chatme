// "use client";

// import { useEffect, useState } from "react";
// import { getMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
// import type { FileAttachment } from "@/interfaces/meseage_related/messageInterFace";
// import { downloadMediaFile } from "@/services/media.service";
// import { Download } from "lucide-react";

// type Props = {
//   file: FileAttachment;
//   isOwnMessage: boolean;
//   isUploading?: boolean;
// };

// export function MediaPreviewLoader({ file, isOwnMessage, isUploading }: Props) {
//   const [blobUrl, setBlobUrl] = useState<string | null>(null);
//   const [downloadProgress, setDownloadProgress] = useState(0);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadError, setDownloadError] = useState(false);

//   useEffect(() => {
//     console.log("lwgyctwygchwluchljwchjwkchkwchk:", file);

//     if (!file?.fileId || !file?.fileType) return;

//     let tempUrl: string | null = null;

//     const loadLocalPreview = async () => {
//       console.log("insdie loadLocalPreview");

//       try {
//         const media = await getMediaFromIndexedDB(file.fileId);
//         if (!media) return;

//         const blob =
//           media instanceof Blob
//             ? media
//             : new Blob([media], { type: file.fileType });
//         tempUrl = URL.createObjectURL(blob);
//         setBlobUrl(tempUrl);
//       } catch {
//         console.log("file not found");
//       }
//     };

//     loadLocalPreview();

//     return () => {
//       if (tempUrl) URL.revokeObjectURL(tempUrl);
//     };
//   }, [file.fileId, file.fileType]);
//   const triggerDownload = (url: string, fileName: string) => {
//     console.log("url:",url, "filename:",fileName);
    
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };
//   const handleDownload = async () => {
//     console.log("file.objectKey:", file.objectName);

//     if (!file.objectName || isDownloading) return;

//     setIsDownloading(true);
//     setDownloadError(false);
//     setDownloadProgress(0);

//     try {
//       console.log("file.objectKey:", file.objectName);
//       const blob = await downloadMediaFile(
//         file.objectName,
//         setDownloadProgress,
//       );
//       await saveMediaToIndexedDB(file.fileId, blob);
//       const url = URL.createObjectURL(blob);
//       setBlobUrl(url);
//       await triggerDownload(blobUrl,file.fileName)
//     } catch {
//       setDownloadError(true);
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const uploadProgress = file.uploadProgress ?? 0;
//   const showUploadProgress =
//     isOwnMessage && (isUploading || uploadProgress < 100);

//   if (showUploadProgress) {
//     return (
//       <div className="mt-1 w-full max-w-[280px]">
//         <p className="text-xs text-gray-300 mb-1">Uploading {file.fileName}</p>
//         <div className="h-2 bg-gray-500 rounded-full overflow-hidden">
//           <div
//             className="h-full bg-green-400 transition-all duration-200"
//             style={{ width: `${uploadProgress}%` }}
//           />
//         </div>
//         <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
//       </div>
//     );
//   }

//   if (!blobUrl && file.objectName && !isOwnMessage) {
//     return (
//       <div className="mt-1 space-y-1">
//         <p className="text-xs text-gray-300">{file.fileName}</p>
//         <button
//           onClick={handleDownload}
//           disabled={isDownloading}
//           className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 disabled:opacity-50"
//         >
//           <Download size={16} />
//           {isDownloading ? "Downloading..." : "Download"}
//         </button>
//         {isDownloading && (
//           <div className="w-full max-w-[280px]">
//             <div className="h-2 bg-gray-500 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-blue-400 transition-all duration-200"
//                 style={{ width: `${downloadProgress}%` }}
//               />
//             </div>
//             <p className="text-xs text-gray-400 mt-1">{downloadProgress}%</p>
//           </div>
//         )}
//         {downloadError && (
//           <p className="text-xs text-red-400">Download failed. Try again.</p>
//         )}
//       </div>
//     );
//   }

//   // if (!blobUrl) {
//   //   return <p className="text-xs italic text-gray-400">Loading media...</p>;
//   // }

//   const isImage = file.fileType.startsWith("image/");
//   const isVideo = file.fileType.startsWith("video/");
//   const isPdf = file.fileType === "application/pdf";

//   return (
//     <div className="mt-1 space-y-1">
//       {isImage && (
//         <img
//           src={blobUrl}
//           alt={file.fileName}
//           className="w-full sm:w-auto max-w-full sm:max-w-[300px] md:max-w-[400px] rounded-md border object-contain"
//         />
//       )}
//       {isVideo && (
//         <video
//           src={blobUrl}
//           controls
//           className="w-full sm:w-auto max-w-full sm:max-w-[350px] md:max-w-[500px] rounded-md border object-contain"
//         />
//       )}
//       {isPdf && (
//         <a
//           href={blobUrl}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="text-blue-500 text-sm break-all"
//         >
//           PDF: {file.fileName}
//         </a>
//       )}
//       {!isImage && !isVideo && !isPdf && !isOwnMessage && (
//         <a
//           href={blobUrl}
//           target="__blank"
//           // download={file.fileName}
//           className="text-blue-500 text-sm break-all"
//         >
//           {file.fileName}
//         </a>
//       )}
//       {!isImage && !isVideo && !isPdf && isOwnMessage && (
//         <a
//           href={blobUrl}
//           // download={file.fileName}
//           className="text-blue-500 text-sm break-all"
//         >
//           {file.fileName}
//         </a>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { getMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
import type { FileAttachment } from "@/interfaces/meseage_related/messageInterFace";
import { downloadMediaFile } from "@/services/media.service";
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  File as FileIcon,
} from "lucide-react";

type Props = {
  file: FileAttachment;
  isOwnMessage: boolean;
  isUploading?: boolean;
};

// --- helper: pick an icon + label based on extension/mime, WhatsApp-style ---
function getFileMeta(file: FileAttachment) {
  const ext = file.fileName.split(".").pop()?.toLowerCase() ?? "";
  const type = file.fileType;

  if (type === "application/pdf" || ext === "pdf")
    return { icon: FileText, label: "PDF" };
  if (["doc", "docx"].includes(ext) || type.includes("word"))
    return { icon: FileText, label: "Word" };
  if (["xls", "xlsx", "csv"].includes(ext) || type.includes("sheet"))
    return { icon: FileSpreadsheet, label: "Sheet" };
  if (["zip", "rar", "7z"].includes(ext))
    return { icon: FileArchive, label: "Archive" };
  if (type.startsWith("audio/"))
    return { icon: FileAudio, label: "Audio" };
  return { icon: FileIcon, label: ext.toUpperCase() || "File" };
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TEXT_LIKE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "json",
  "md",
  "txt",
  "css",
  "html",
  "htm",
  "xml",
  "yaml",
  "yml",
  "sh",
  "py",
  "java",
  "go",
  "rs",
  "c",
  "cpp",
  "h",
  "sql",
  "env",
  "license",
  "config",
]);

function resolveMimeType(file: FileAttachment): string {
  const ext = file.fileName.split(".").pop()?.toLowerCase() ?? "";
  const type = file.fileType || "";

  if (TEXT_LIKE_EXTENSIONS.has(ext)) {
    if (ext === "json") return "application/json";
    if (ext === "html" || ext === "htm") return "text/html";
    if (ext === "css") return "text/css";
    return "text/plain";
  }

  if (type && type !== "application/octet-stream") return type;

  const byExt: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    mp3: "audio/mpeg",
  };

  return byExt[ext] || type || "application/octet-stream";
}

async function toTypedBlob(
  media: Blob | ArrayBuffer,
  mimeType: string,
): Promise<Blob> {
  if (media instanceof Blob) {
    if (media.type === mimeType) return media;
    return new Blob([await media.arrayBuffer()], { type: mimeType });
  }

  return new Blob([media], { type: mimeType });
}

function canOpenInBrowser(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/pdf" ||
    mimeType === "application/json"
  );
}

export function MediaPreviewLoader({ file, isOwnMessage, isUploading }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    if (!file?.fileId) return;

    const mimeType = resolveMimeType(file);
    let tempUrl: string | null = null;

    const loadLocalPreview = async () => {
      try {
        const media = await getMediaFromIndexedDB(file.fileId);
        if (!media) return;

        const blob = await toTypedBlob(media, mimeType);
        tempUrl = URL.createObjectURL(blob);
        setBlobUrl(tempUrl);
      } catch {
        console.log("file not found");
      }
    };

    loadLocalPreview();

    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [file.fileId, file.fileType]);

  // force a real save-to-disk instead of relying on browser blob-navigation guessing
  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // this is what actually forces "save" behavior reliably
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    const storageKey = file.objectName || file.objectKey;
    if (!storageKey || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(false);
    setDownloadProgress(0);

    try {
      const downloaded = await downloadMediaFile(storageKey, setDownloadProgress);
      const mimeType = resolveMimeType(file);
      const blob = await toTypedBlob(downloaded, mimeType);
      await saveMediaToIndexedDB(file.fileId, blob);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch {
      setDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadProgress = file.uploadProgress ?? 0;
  const isRemoteMediaReady = Boolean(file.objectKey || file.objectName);
  const showUploadProgress =
    isOwnMessage &&
    isUploading === true &&
    !isRemoteMediaReady &&
    uploadProgress < 100;

  if (showUploadProgress) {
    return (
      <div className="mt-1 w-full max-w-[280px]">
        <p className="text-xs text-gray-300 mb-1">Uploading {file.fileName}</p>
        <div className="h-2 bg-gray-500 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{uploadProgress}%</p>
      </div>
    );
  }

  if (!blobUrl && isRemoteMediaReady) {
    return (
      <div className="mt-1 space-y-1">
        <p className="text-xs text-gray-300">{file.fileName}</p>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 disabled:opacity-50"
        >
          <Download size={16} />
          {isDownloading ? "Downloading..." : "Download"}
        </button>
        {isDownloading && (
          <div className="w-full max-w-[280px]">
            <div className="h-2 bg-gray-500 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-200"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{downloadProgress}%</p>
          </div>
        )}
        {downloadError && (
          <p className="text-xs text-red-400">Download failed. Try again.</p>
        )}
      </div>
    );
  }

  const mimeType = resolveMimeType(file);
  const isImage = mimeType.startsWith("image/");
  const isVideo = mimeType.startsWith("video/");
  const isPdf = mimeType === "application/pdf";
  const isOther = !isImage && !isVideo && !isPdf;

  const { icon: Icon, label } = getFileMeta(file);

  const openFile = async (url: string | null) => {
    if (!url) return;

    if (canOpenInBrowser(mimeType)) {
      const response = await fetch(url);
      const blob = await toTypedBlob(await response.blob(), mimeType);
      const typedUrl = URL.createObjectURL(blob);
      window.open(typedUrl, "_blank", "noopener,noreferrer");
      return;
    }

    triggerDownload(url, file.fileName);
  };
  return (
    <div className="mt-1 space-y-1">
      {isImage && (
        <img
          src={blobUrl!}
          alt={file.fileName}
          className="w-full sm:w-auto max-w-full sm:max-w-[300px] md:max-w-[400px] rounded-md border object-contain"
        />
      )}
      {isVideo && (
        <video
          src={blobUrl!}
          controls
          className="w-full sm:w-auto max-w-full sm:max-w-[350px] md:max-w-[500px] rounded-md border object-contain"
        />
      )}
      {isPdf && (
        <a
          href={blobUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm break-all"
        >
          PDF: {file.fileName}
        </a>
      )}

      {/* WhatsApp-style generic document card for everything else */}
      {isOther && (
        <div
          onClick={() => openFile(blobUrl)}
          className="flex items-center gap-3 w-full max-w-[280px] p-2 rounded-lg bg-gray-700/60 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-600 shrink-0">
            <Icon size={20} className="text-gray-200" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{file.fileName}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </div>
      )}
    </div>
  );
}