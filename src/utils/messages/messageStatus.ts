import { MessageData } from "@/interfaces/meseage_related/messageInterFace";

export type MessageDeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read";

export type MessageStatusFields = Pick<
  MessageData,
  "isSent" | "delivered" | "isRead" | "isUploading"
>;

/**
 * Resolves the delivery status for a message.
 * Order matters — add new states here as the last/highest priority checks.
 */
export function resolveMessageDeliveryStatus(
  message: MessageStatusFields,
): MessageDeliveryStatus {
  if (message.isUploading) return "pending";
  if (message.isRead) return "read";
  if (message.delivered) return "delivered";
  if (message.isSent) return "sent";
  return "pending";
}
