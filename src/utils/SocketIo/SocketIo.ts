import { io, Socket } from "socket.io-client";

let socket: Socket | null;
let socketUserId: string | null = null;

export const getSocket = (mobile: any): Socket => {
  // No valid identity yet — don't create a doomed connection
  if (!mobile) {
    if (socket) {
      socket.disconnect();
      socket = null;
      socketUserId = null;
    }
    throw new Error("getSocket called without a valid userId");
  }
  // Existing socket is for a different (or no) user — replace it
  if (socket && socketUserId !== mobile) {
    socket.disconnect();
    socket = null;
    socketUserId = null;
  }
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_MAIN_URL, {
      transports: ["websocket"],
      secure: true,
      autoConnect: false,
      query: { userId: mobile },
    });
    socketUserId = mobile;
  }
  return socket;
};

export const closeSocket = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!socket) {
      resolve();
      return;
    }

    const activeSocket = socket;
    socket = null;
        socketUserId = null;

    const finish = () => resolve();

    if (!activeSocket.connected) {
      finish();
      return;
    }

    activeSocket.once("disconnect", finish);

    // Tell the server to mark offline before the page unloads on logout.
    activeSocket.emit("go-offline");

    window.setTimeout(() => {
      activeSocket.disconnect();
    }, 150);

    window.setTimeout(finish, 2000);
  });
};
