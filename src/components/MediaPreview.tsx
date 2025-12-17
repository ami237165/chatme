import { useViewportHeight } from "@/utils/useViewportHeight";
import { X } from "lucide-react";

type FileAttachment = {
  fileName: string;
  fileType: string;
  fileId?: any; // base64 or blob URL
  previewUrl?: any;
};

type MediaPreviewProps = {
  files: FileAttachment[];
  onRemove: (index: number) => void;
};

export const MediaPreview = ({ files, onRemove }: MediaPreviewProps) => {
  useViewportHeight();
  return (
    <div className="flex overflow-x-auto gap-1 max-w-fit no-scrollbar mx-1 p-1 rounded-lg bg-gray-500">
      {files.map((file, index) => {
        console.log("Rendering file preview:", file);
        
        const isImage = file.fileType.startsWith("image/");
        const isVideo = file.fileType.startsWith("video/");
        const isPdf = file.fileType === "application/pdf";

        return (
          <div
            key={index}
            className="relative flex-shrink-0 
    h-[30vh] w-[65vw] max-w-fit           
    sm:max-h-40 sm:max-w-40             
    md:max-h-48 md:max-w-48             
    lg:max-h-52 lg:max-w-52              
    rounded border border-gray-600 overflow-hidden"
          >
            <button
              className="absolute z-50 top-1 right-1 bg-transparent text-white text-xs rounded w-5 h-5 flex items-center justify-center hover:bg-red-600"
              onClick={() => onRemove(index)}
            >
              <X size={50} />
            </button>

            {isImage && (
              <img
                src={file.previewUrl}
                alt={file.fileName}
                className="w-full h-full object-fill"
              />
            )}

            {isVideo && (
              <video
                src={file.previewUrl}
                controls
                className="w-full h-full object-fill"
              />
            )}

            {isPdf ? (
              <a
                href={file.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm mt-2"
              >
                📄 {file.fileName}
              </a>
            ) : !isImage && !isVideo ? (
              <a
                href={file.previewUrl}
                download={file.fileName}
                className="w-full h-full object-fill"
              >
                📎 {file.fileName}
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
