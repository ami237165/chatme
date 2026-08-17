import { useLoadMessagesMutation } from "@/store/apiServices/loadMsg";

export const useLoadMessagesService = () => {
  const [loadMsgs] = useLoadMessagesMutation();

  const loadMessages = async ({ roomId, from, to,start,stop }) => {
    return await loadMsgs({ roomId, from, to,start,stop }).unwrap();
  };

  return { loadMessages };
};
export const useConversationService = () => {
  const [conversation] = useLoadMessagesMutation();

  const createConvMetadata = async (data) => {
    return await conversation(data).unwrap();
  };

  return { createConvMetadata };
};
