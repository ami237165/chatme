"use client";

import { useEffect, useState } from "react";
import { getMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
import type { FileAttachment } from "@/interfaces/meseage_related/messageInterFace";
import { downloadMediaFile } from "@/services/media.service";
import { Download } from "lucide-react";

type Props = {
  file: FileAttachment;
  isOwnMessage: boolean;
  isUploading?: boolean;
};

export function MediaPreviewLoader({
  file,
  isOwnMessage,
  isUploading,
}: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    if (!file?.fileId || !file?.fileType) return;

    let tempUrl: string | null = null;

    const loadLocalPreview = async () => {
      try {
        const media = await getMediaFromIndexedDB(file.fileId);
        if (!media) return;

        const blob =
          media instanceof Blob
            ? media
            : new Blob([media], { type: file.fileType });
        tempUrl = URL.createObjectURL(blob);
        setBlobUrl(tempUrl);
      } catch {
        // local preview unavailable
      }
    };

    loadLocalPreview();

    return () => {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
    };
  }, [file.fileId, file.fileType]);

  const handleDownload = async () => {
    if (!file.objectKey || isDownloading) return;

    setIsDownloading(true);
    setDownloadError(false);
    setDownloadProgress(0);

    try {
      const blob = await downloadMediaFile(file.objectKey, setDownloadProgress);
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
  const showUploadProgress = isOwnMessage && (isUploading || uploadProgress < 100);

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

  if (!blobUrl && file.objectKey && !isOwnMessage) {
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

  if (!blobUrl) {
    return <p className="text-xs italic text-gray-400">Loading media...</p>;
  }

  const isImage = file.fileType.startsWith("image/");
  const isVideo = file.fileType.startsWith("video/");
  const isPdf = file.fileType === "application/pdf";

  return (
    <div className="mt-1 space-y-1">
      {isImage && (
        <img
          src={blobUrl}
          alt={file.fileName}
          className="w-full sm:w-auto max-w-full sm:max-w-[300px] md:max-w-[400px] rounded-md border object-contain"
        />
      )}
      {isVideo && (
        <video
          src={blobUrl}
          controls
          className="w-full sm:w-auto max-w-full sm:max-w-[350px] md:max-w-[500px] rounded-md border object-contain"
        />
      )}
      {isPdf && (
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm break-all"
        >
          PDF: {file.fileName}
        </a>
      )}
      {!isImage && !isVideo && !isPdf &&  !isOwnMessage && (
        <a
          href={blobUrl}
          download={file.fileName}
          className="text-blue-500 text-sm break-all"
        >
          Download {file.fileName}
        </a>
      )}
      {!isImage && !isVideo && !isPdf &&  isOwnMessage && (
        <a
          // href={blobUrl}
          // download={file.fileName}
          className="text-blue-500 text-sm break-all"
        >
        {file.fileName}
        </a>
      )}
    </div>
  );
}
