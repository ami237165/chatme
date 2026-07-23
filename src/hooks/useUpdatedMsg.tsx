import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { updateMessage } from "@/store/slices/message.slice";
import { useDispatch } from "react-redux";

export const useUpdateMsg = () => {
  const dispatch = useDispatch();
  const handleUpdateMessage = async (
    roomId: any,
    messageId: any,
    updates: Partial<MessageData>,
  ) => {    
    dispatch(updateMessage({ roomId, messageId, updates: updates }));
  };
  return { handleUpdateMessage };
};
