import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { updateFileProgress, updateMessage } from "@/store/slices/message.slice";
import { useDispatch } from "react-redux";

export const useUpdateMsg = () => {
  const dispatch = useDispatch();
  const handleUpdateMessage = async (
    roomId: string,
    messageId: string,
    updates: Partial<MessageData>,
  ) => {
    dispatch(updateMessage({ roomId, messageId, updates }));
  };

  const handleUpdateFileProgress = (
    roomId: string,
    messageId: string,
    fileId: string,
    uploadProgress: number,
    objectKey?: string,
  ) => {
    dispatch(
      updateFileProgress({ roomId, messageId, fileId, uploadProgress, objectKey }),
    );
  };

  return { handleUpdateMessage, handleUpdateFileProgress };
};
