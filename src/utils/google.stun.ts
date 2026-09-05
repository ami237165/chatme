export const config = {
  iceServers: [
    {
    urls: [
      "stun:turn.arktycoon.com:3478",
      "turn:turn.arktycoon.com:3478?transport=udp"
    ],
    username: "arkturn",
    credential: "%48@SANPADAa"
  } // Free STUN server
  ],
};
// export const config = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' }, // Free STUN server
//   ],
// };

