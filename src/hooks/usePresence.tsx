"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { log } from "console";

interface PresenceState {
  online: boolean;
  lastSeen: number | null;
}

export const usePresence = (currentMobile: string, otherUserMobile: string) => {
  const [presence, setPresence] = useState<PresenceState>({
    online: false,
    lastSeen: null,
  });

  useEffect(() => {
    if (!currentMobile || !otherUserMobile) return;

    const socket = getSocket(currentMobile);

    const askPresence = () => {
      socket.emit("check-presence", { userId: otherUserMobile });
    };

    // Ask immediately if already connected...
    if (socket.connected) askPresence();

    // ...and every time the socket (re)connects, in case it was ever dropped
    socket.on("connect", askPresence);

    socket.on("presence-status", ({ online, lastSeen }) => {
      setPresence({ online, lastSeen });
    });

    socket.on("user-online", ({ userId }) => {
      if (userId === otherUserMobile) {
        setPresence((prev) => ({ ...prev, online: true, lastSeen: null }));
      }
    });

    socket.on("user-offline", ({ userId }) => {
      if (userId === otherUserMobile) {
        setPresence((prev) => ({
          ...prev,
          online: false,
          lastSeen: Date.now(),
        }));
      }
    });

    return () => {
      socket.off("connect", askPresence);
      socket.off("presence-status");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [currentMobile, otherUserMobile]);

  return presence;
};
