"use client";
import { useEffect, useState } from "react";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { log } from "console";

interface PresenceState {
  online: boolean;
  lastSeen: number | null;
}

export const usePresence = (
  currentMobile: string,
  otherUserMobile: string
) => {
  const [presence, setPresence] = useState<PresenceState>({
    online: false,
    lastSeen: null,
  });

  useEffect(() => {
    if (!currentMobile || !otherUserMobile) return;
console.log("hitting usePresence");

    const socket = getSocket(currentMobile);

    // Ask server for current status
    socket.emit("check-presence", { userId: otherUserMobile });

    // When server sends initial presence
    socket.on("presence-status", ({ online, lastSeen }) => {
      setPresence({ online, lastSeen });
    });

    // Live ONLINE event
    socket.on("user-online", ({ userId }) => {
        
      if (userId === otherUserMobile) {
                
        setPresence((prev) => ({
          ...prev,
          online: true,
          lastSeen: null,
        }));
      }
    });

    // Live OFFLINE event
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
      socket.off("presence-status");
      socket.off("user-online");
      socket.off("user-offline");
    };
  }, [currentMobile, otherUserMobile]);

  return presence;
};
