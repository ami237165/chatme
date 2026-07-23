"use client";

import { Check, CheckCheck, Clock, LucideIcon } from "lucide-react";
import {
  MessageDeliveryStatus,
  MessageStatusFields,
  resolveMessageDeliveryStatus,
} from "@/utils/messages/messageStatus";

type StatusConfig = {
  icon: LucideIcon;
  label: string;
  iconClassName: string;
};

const STATUS_CONFIG: Record<MessageDeliveryStatus, StatusConfig> = {
  pending: {
    icon: Clock,
    label: "Sending",
    iconClassName: "text-gray-300",
  },
  sent: {
    icon: Check,
    label: "Sent",
    iconClassName: "text-gray-300",
  },
  delivered: {
    icon: CheckCheck,
    label: "Delivered",
    iconClassName: "text-gray-300",
  },
  read: {
    icon: CheckCheck,
    label: "Read",
    iconClassName: "text-sky-400",
  },
};

type MessageStatusIndicatorProps = {
  message: MessageStatusFields;
  className?: string;
};

export default function MessageStatusIndicator({
  message,
  className = "",
}: MessageStatusIndicatorProps) {
  const status = resolveMessageDeliveryStatus(message);
  const { icon: Icon, label, iconClassName } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon className={`h-3.5 w-3.5 ${iconClassName}`} strokeWidth={2.5} />
    </span>
  );
}
