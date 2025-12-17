import { useLoadMessagesMutation } from "@/store/apiServices/loadMsg";

export const useLoadMessagesService = () => {
  const [loadMsgs] = useLoadMessagesMutation();

  const loadMessages = async ({ roomId, from, to }) => {
    return await loadMsgs({ roomId, from, to }).unwrap();
  };

  return { loadMessages };
};
