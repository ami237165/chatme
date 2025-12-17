import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { saveMediaToIndexedDB } from "@/lib/indexdb";
import { addMessage } from "@/store/slices/message.slice";
import { useDispatch } from "react-redux";

export const useHandleNewMsg = () => {
  const dispatch = useDispatch();
  const handleNewMessage = async (roomId: any, msg: MessageData) => {
    if (msg.hasFiles && msg.files?.length) {
      for (const file of msg.files) {
        if (file.fileData) {
          let arrayBuffer;

          if (file.fileData instanceof File) {
            arrayBuffer = await file.fileData.arrayBuffer();
          } else if (file.fileData instanceof Uint8Array) {
            arrayBuffer = file.fileData.buffer.slice(
              file.fileData.byteOffset,
              file.fileData.byteOffset + file.fileData.byteLength
            );
          } else if (file.fileData instanceof ArrayBuffer) {
            arrayBuffer = file.fileData;
          } else {
            console.warn("Unsupported fileData type", file.fileData);
            continue;
          }
          try {
            await saveMediaToIndexedDB(file.fileId, arrayBuffer);
          } catch (error) {
            console.log("Failed to save to IndexedDB:,", error);
          }

          delete file.fileData; // ✅ Clean up for Redux
          delete file?.previewUrl;
        }
      }
    }

    dispatch(addMessage({ roomId, message: msg }));
  };
  return {handleNewMessage};
};
