// hooks/useUnreadMsg.ts
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MessageData } from "@/interfaces/meseage_related/messageInterFace";

const getUnreadMessagesFromLatest = (
  messages: MessageData[] | undefined,
): MessageData[] => {
  if (!Array.isArray(messages) || messages.length === 0) return [];

  const unread: MessageData[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    if (msg.isRead) {
      break; // hit a read message — everything before this is older, stop scanning
    }

    unread.push(msg);
  }

  return unread.reverse();
};

interface RoomUnreadInfo {
  messages: MessageData[];
  count: number;
}

export const useUnreadMessages = () => {
  // state.message IS the { [roomId]: MessageData[] } map — no .messages nesting
  const conversations = useSelector((state: RootState) => state.message) ?? {};
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);

  const unreadByRoomId = useMemo(() => {
    const result: Record<string, RoomUnreadInfo> = {};

    for (const roomId in conversations) {
      if (roomId === "_persist") continue;

      const roomMessages = conversations[roomId];
      if (!Array.isArray(roomMessages)) continue;

      const unreadMsgs = getUnreadMessagesFromLatest(roomMessages).filter(
        (msg) => msg.sender !== currentMobile,
      );

      result[roomId] = {
        messages: unreadMsgs,
        count: unreadMsgs.length,
      };
    }

    return result;
  }, [conversations]);

  return { unreadByRoomId };
};
