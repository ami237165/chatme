import { io, Socket } from "socket.io-client";
import { store } from "@/store";
import { getBrowserSessionId } from "@/utils/browserSession";
import { isTokenValid } from "@/utils/token_decoder";

let socket: Socket | null;
let socketUserId: string | null = null;
let socketToken: string | null = null;

type CloseReason = "logout" | "tab-close";

const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketUserId = null;
  socketToken = null;
};

const resolveCredentials = (mobile: string) => {
  const token = store.getState().auth.access_token;
  const browserSessionId = getBrowserSessionId();
  return { token, browserSessionId };
};

export const getSocket = (mobile: string): Socket => {
  if (!mobile) {
    destroySocket();
    throw new Error("getSocket called without a valid userId");
  }

  const { token, browserSessionId } = resolveCredentials(mobile);

  if (!token || !isTokenValid(token) || !browserSessionId) {
    destroySocket();
    throw new Error("getSocket called without valid auth");
  }

  if (
    socket &&
    (socketUserId !== mobile || socketToken !== token)
  ) {
    destroySocket();
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_MAIN_URL, {
      transports: ["websocket"],
      secure: true,
      autoConnect: false,
      auth: {
        token,
        browserSessionId,
      },
      query: { userId: mobile, browserSessionId },
    });
    socketUserId = mobile;
    socketToken = token;
  }

  return socket;
};

export const emitGoOffline = (): void => {
  if (socket?.connected) {
    socket.emit("go-offline");
  }
};

export const closeSocket = (reason: CloseReason = "tab-close"): Promise<void> => {
  return new Promise((resolve) => {
    if (!socket) {
      resolve();
      return;
    }

    const activeSocket = socket;
    socket = null;
    socketUserId = null;
    socketToken = null;

    const finish = () => resolve();

    if (!activeSocket.connected) {
      finish();
      return;
    }

    activeSocket.once("disconnect", finish);

    if (reason === "logout") {
      activeSocket.emit("logout");
    } else {
      activeSocket.emit("go-offline");
    }

    window.setTimeout(() => {
      activeSocket.disconnect();
    }, 150);

    window.setTimeout(finish, 2000);
  });
};
