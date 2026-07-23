import { FileAttachment } from "@/interfaces/meseage_related/messageInterFace";
import { deleteMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
import { useRef, useState } from "react";

export const useHandleFileChange = () => {
  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const convertToPreview = async (file: File): Promise<FileAttachment> => {
      console.log("in convertToPreview",Date.now());
      
      const fileId = `file_${crypto.randomUUID()}`; // ✅ Unique ID
      console.log();
      
      const blobUrl = URL.createObjectURL(file); // ✅ For preview
      console.log("in convertToPreview after createObjectURL",Date.now());

      // try {
      //   await saveMediaToIndexedDB(fileId, file).then((res) =>{
      //     console.log("res of saveMediaToIndexedDB :",res,fileId);
          
      //   }).catch((err) =>{
      //     console.log("err of saveMediaToIndexedDB :",err);
          
      //   });

      // } catch (error) {
      //   console.log("error while saveMediaToIndexedDB :",error);
        
      // }
      // await saveMediaToIndexedDB(fileId, file); // ✅ Save to IndexedDB

      return {
        fileName: file.name,
        fileType: file.type,
        previewUrl: blobUrl,
        fileData: file,
        fileId: fileId, // ✅ store just ID (reference)
      };
    };

    try {
      const results = await Promise.all(
        Array.from(files).map((file) => convertToPreview(file))
      );

      setPendingFiles((prev) => [...prev, ...results]);

      // Reset input value
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      
    }
  };
  const removedFileFromDB = async (index: number) => {
    
    const removedFile = pendingFiles[index];

    if (!removedFile) return;

    // Remove from memory preview
    URL.revokeObjectURL(removedFile.previewUrl);

    // Remove from IndexedDB
    if (removedFile.fileId) {
      await deleteMediaFromIndexedDB(removedFile.fileId).catch(console.error);
    }

    // Remove from UI list
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
