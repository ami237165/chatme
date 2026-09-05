import { FileAttachment, MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { addMessage } from "@/store/slices/message.slice";
import { toTimestampSecondsString } from "@/utils/timestamp";
import { useDispatch } from "react-redux";

function isRemoteMediaReady(files?: FileAttachment[]) {
  return Boolean(files?.some((file) => file.objectKey || file.objectName));
}

function normalizeMessage(msg: MessageData): MessageData {
  const remoteMediaReady = isRemoteMediaReady(msg.files);

  return {
    ...msg,
    timestamp: toTimestampSecondsString(msg.timestamp),
    isUploading: remoteMediaReady ? false : msg.isUploading,
    isSent: remoteMediaReady ? true : msg.isSent,
    files: msg.files?.map(
      ({
        fileName,
        fileType,
        fileId,
        objectName,
        objectKey,
        uploadProgress,
        downloadProgress,
      }) => ({
        fileName,
        fileType,
        fileId,
        objectName,
        objectKey,
        uploadProgress:
          objectKey || objectName ? 100 : uploadProgress,
        downloadProgress,
      }),
    ),
  };
}

export const useHandleNewMsg = () => {
  const dispatch = useDispatch();

  const handleNewMessage = async (roomId: string, msg: MessageData) => {
    dispatch(addMessage({ roomId, message: normalizeMessage(msg) }));
  };

  return { handleNewMessage };
};
