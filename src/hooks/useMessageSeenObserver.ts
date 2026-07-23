"use client";

import { useEffect, useRef } from "react";
import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { useUpdateMsg } from "./useUpdatedMsg";

type UseMessageSeenObserverParams = {
  message: MessageData;
  currentMobile: string;
  roomId: string;
  scrollRoot: HTMLElement | null;
};

export function useMessageSeenObserver({
  message,
  currentMobile,
  roomId,
  scrollRoot,
}: UseMessageSeenObserverParams) {
    console.log("inside function of observer");

  const { handleUpdateMessage } = useUpdateMsg();
  const elementRef = useRef<HTMLDivElement>(null);
  const hasEmittedRef = useRef(false);

  useEffect(() => {
    console.log("inside useEffect of observer");
    
    if (hasEmittedRef.current) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasEmittedRef.current) return;

        hasEmittedRef.current = true;

        const socket = getSocket(currentMobile);
        socket.emit("message_seen", {
          msg_id: message.id,
          sender: message.sender,
          receiver: currentMobile,
          roomId,
        });

        observer.disconnect();
        handleUpdateMessage(roomId, message.id, { isRead: true });
      },
      {
        root: scrollRoot,
        threshold: 0.6,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    currentMobile,
    message.id,
    message.sender,
    roomId,
    scrollRoot,
    handleUpdateMessage,
  ]);

  return elementRef;
}
