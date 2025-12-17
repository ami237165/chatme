export function formatLastSeen(timestamp: number) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return `Last seen at ${timeStr}`;
  }

  if (isYesterday) {
    return `Last seen yesterday at ${timeStr}`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();

  if (isSameYear) {
    return `Last seen ${date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    })}, ${timeStr}`;
  }

  return `Last seen ${date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${timeStr}`;
}
