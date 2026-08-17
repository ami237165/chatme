"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { isTokenValid } from "@/utils/token_decoder";

interface PresenceState {
  online: boolean;
  lastSeen: number | null;
}

export const usePresence = (currentMobile: string, otherUserMobile: string) => {
  const token = useSelector((state: any) => state.auth.access_token);
  const [presence, setPresence] = useState<PresenceState>({
    online: false,
    lastSeen: null,
  });

  useEffect(() => {
    if (!currentMobile || !otherUserMobile || !isTokenValid(token)) return;
    console.log("PRESENCE EFFECT START", otherUserMobile);

    const socket = getSocket(currentMobile);

    const addMeToWatchers = () => {
      socket.emit("add-me-to-watchers", { targetUserId: otherUserMobile });
    };
    const askPresence = () => {
      socket.emit("check-presence", { userId: otherUserMobile });
    };

    let initialized = false;

    const initializePresence = () => {
      if (initialized) return;
      initialized = true;
      console.log("called in initializePresence");
      askPresence();
      addMeToWatchers();
    };

    // Ask immediately if already connected...
    if (socket.connected) {
      console.log("socket already connected, initializing presence");
      initializePresence();
    } else {
      console.log("socket not connected, waiting for connect event");
      socket.once("connect", initializePresence);
    }
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

    const removeMeFromWatchers = () => {
      socket.emit("remove-me-from-watchers", { targetUserId: otherUserMobile });
    }

    return () => {
      console.log("PRESENCE EFFECT CLEANUP", otherUserMobile);
      socket.off("connect", initializePresence);

      // socket.off("connect", addMeToWatchers);
      socket.off("presence-status");
      socket.off("user-online");
      socket.off("user-offline");
      removeMeFromWatchers();
    };
  }, [currentMobile, otherUserMobile, token]);

  return presence;
};
