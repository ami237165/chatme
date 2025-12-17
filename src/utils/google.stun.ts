export const config = {
  iceServers: [
    {
    urls: [
      "stun:13.203.231.167:3478",
      "turn:13.203.231.167:3478?transport=udp"
    ],
    username: "testuser",
    credential: "testpasyys"
  } // Free STUN server
  ],
};
// export const config = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' }, // Free STUN server
//   ],
// };

