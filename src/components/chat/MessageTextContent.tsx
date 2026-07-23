"use client";

import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import MessageStatusIndicator from "./MessageStatusIndicator";

type MessageTextContentProps = {
  text: string;
  message: MessageData;
  currentMobile: string;
};

/**
 * Renders message text with optional delivery status for the sender.
 * Extend this wrapper when adding more per-message UI (reactions, edits, etc.).
 */
export default function MessageTextContent({
  text,
  message,
  currentMobile,
}: MessageTextContentProps) {
  const isOwnMessage = message.sender === currentMobile;

  return (
    <p className="flex items-end justify-end gap-1.5">
      <span className="break-words">{text}</span>
      {isOwnMessage && (
        <MessageStatusIndicator message={message} className="mb-0.5" />
      )}
    </p>
  );
}
