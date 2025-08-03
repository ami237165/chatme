import { io, Socket } from "socket.io-client";

let socket: Socket | null;

export const getSocket = (mobile: any):Socket => {
  console.log("getSocket hit");
    if(!socket){
      console.log("returning new socket");
      
         socket = io(process.env.NEXT_SOCKET_MAIN_URL, {
      transports: ["websocket"],
      secure: true,
      autoConnect: false,
      query:{userId:mobile}
    });
    }
    return socket
}

//close the socket
export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};