"use client";

import { ReactNode, Ref } from "react";
import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { useMessageSeenObserver } from "@/hooks/useMessageSeenObserver";

type ChatMessageBubbleProps = {
  message: MessageData;
  currentMobile: string;
  roomId: string;
  scrollRoot: HTMLElement | null;
  children: ReactNode;
};

function getBubbleClassName(isOwnMessage: boolean) {
  return `w-fit px-4 py-2 my-1 rounded-xs break-words max-w-[80%] min-w-[3rem] shadow-gray-300 z-30 ${
    isOwnMessage
      ? "bg-gray-600 text-white self-end ml-auto"
      : "bg-white text-gray-800 self-start mr-auto"
  }`;
}

function MessageBubbleShell({
  isOwnMessage,
  bubbleRef,
  children,
}: {
  isOwnMessage: boolean;
  bubbleRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div ref={bubbleRef} className={getBubbleClassName(isOwnMessage)}>
      {children}
    </div>
  );
}

/** Only mounted for unread incoming messages — hook runs only when this renders. */
function ObservedIncomingMessageBubble({
  message,
  currentMobile,
  roomId,
  scrollRoot,
  children,
}: ChatMessageBubbleProps) {
  const elementRef = useMessageSeenObserver({
    message,
    currentMobile,
    roomId,
    scrollRoot,
  });

  return (
    <MessageBubbleShell isOwnMessage={false} bubbleRef={elementRef}>
      {children}
    </MessageBubbleShell>
  );
}

export default function ChatMessageBubble({
  message,
  currentMobile,
  roomId,
  scrollRoot,
  children,
}: ChatMessageBubbleProps) {
  const isOwnMessage = message.sender === currentMobile;
  const shouldObserve = !isOwnMessage && !message.isRead;

  if (shouldObserve) {
    return (
      <ObservedIncomingMessageBubble
        message={message}
        currentMobile={currentMobile}
        roomId={roomId}
        scrollRoot={scrollRoot}
      >
        {children}
      </ObservedIncomingMessageBubble>
    );
  }

  return (
    <MessageBubbleShell isOwnMessage={isOwnMessage}>{children}</MessageBubbleShell>
  );
}
