import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { addMessage } from "@/store/slices/message.slice";
import { useDispatch } from "react-redux";

export const useHandleNewMsg = () => {
  const dispatch = useDispatch();

  const handleNewMessage = async (roomId: string, msg: MessageData) => {
    const cleanMsg: MessageData = {
      ...msg,
      files: msg.files?.map(({ fileName, fileType, fileId,objectName, objectKey, uploadProgress, downloadProgress }) => ({
        fileName,
        fileType,
        fileId,
        objectName,
        objectKey,
        uploadProgress,
        downloadProgress,
      })),
    };

    dispatch(addMessage({ roomId, message: cleanMsg }));
  };

  return { handleNewMessage };
};
