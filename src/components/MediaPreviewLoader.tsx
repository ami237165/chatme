'use client';
import { useEffect, useState } from 'react';
import { getMediaFromIndexedDB } from '@/lib/indexdb';
import type { FileAttachment } from '@/interfaces/meseage_related/messageInterFace'; // adjust the import path as needed

// type Props = {
//   file: FileAttachment;
// };

export function MediaPreviewLoader({ file }: any) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
  let isMounted = true;
  let tempUrl: string | null = null;

  const fetchBlob = async () => {
    try {
      const media = await getMediaFromIndexedDB(file.fileId);
      console.log("media ,", media);
      
      if (media && isMounted) {
        const blob = new Blob([media], { type: file.fileType });
        tempUrl = URL.createObjectURL(blob);
        setBlobUrl(tempUrl);
      }
    } catch (err) {
      console.error('Failed to load media from IndexedDB:', err);
    }
  };

  fetchBlob();

  return () => {
    isMounted = false;
    if (tempUrl) {
      URL.revokeObjectURL(tempUrl);
    }
  };
}, [file.fileId]);


  const isImage = file.fileType.startsWith('image/');
  const isVideo = file.fileType.startsWith('video/');
  const isPdf = file.fileType === 'application/pdf';

  if (!blobUrl)
    return <p className="text-xs italic text-gray-400">Loading media...</p>;

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
      {!isImage && !isVideo && !isPdf && (
        <a
          href={blobUrl}
          download={file.fileName}
          className="text-blue-500 text-sm break-all"
        >
          Download {file.fileName}
        </a>
      )}
    </div>
  );
}
