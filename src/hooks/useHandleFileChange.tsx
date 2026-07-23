import { FileAttachment } from "@/interfaces/meseage_related/messageInterFace";
import { deleteMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 100 MB
console.log(MAX_FILE_SIZE);

export const useHandleFileChange = () => {
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const convertToPreview = async (file: File): Promise<FileAttachment | null> => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 100 MB)`);
        return null;
      }

      const fileId = `file_${crypto.randomUUID()}`;
      const blobUrl = URL.createObjectURL(file);

      await saveMediaToIndexedDB(fileId, file);

      return {
        fileName: file.name,
        fileType: file.type,
        previewUrl: blobUrl,
        fileData: file,
        fileId,
      };
    };

    try {
      const results = (
        await Promise.all(Array.from(files).map((file) => convertToPreview(file)))
      ).filter((file): file is FileAttachment => file !== null);

      setPendingFiles((prev) => [...prev, ...results]);

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Failed to prepare file");
    }
  };

  const removedFileFromDB = async (index: number) => {
    const removedFile = pendingFiles[index];
    if (!removedFile) return;

    URL.revokeObjectURL(removedFile.previewUrl || "");
    if (removedFile.fileId) {
      await deleteMediaFromIndexedDB(removedFile.fileId).catch(console.error);
    }

    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    handleFileChange,
    fileInputRef,
    pendingFiles,
    setPendingFiles,
    removedFileFromDB,
  };
};
