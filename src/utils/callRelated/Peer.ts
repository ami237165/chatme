import { store } from "@/store";
import { config } from "../google.stun";
import { getSocket } from "../SocketIo/SocketIo";
import { videoActions } from "@/store/slices/callSlice";

let peer: RTCPeerConnection | null = null;
let pendingCandidates: RTCIceCandidateInit[] = [];

export const getPeer = (mobile?: undefined) => {
  if (!peer || peer.signalingState === "closed") {
    peer = new RTCPeerConnection(config);

    // Remote stream handling
    const remoteStream = new MediaStream();
    peer.ontrack = (event) => {
      console.log("ontrack fired with streams:", event.streams);
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
      store.dispatch(videoActions.setRemoteStream(remoteStream));
    };

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        let currentMobile = store.getState().auth.currentMobile;
        let roomId = [mobile, currentMobile].sort().join("_");
        const socket = getSocket(currentMobile);
        socket.emit("ice-candidate", {
          sender:currentMobile,
          receiver:mobile,
          roomId: roomId,
          candidate: event.candidate,
        });
      }
    };
  }
  return peer;
};

export const resetPeer = () => {
  if (peer) {
    peer.getSenders().forEach((sender) => sender.track?.stop());
    peer.close();
    peer = null;
  }
  return getPeer(); // create a fresh one
};

export const addCandidateSafely = async (candidate: RTCIceCandidateInit) => {
  if (peer && peer.remoteDescription) {
    try {
      await peer.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error adding ICE candidate:", err);
    }
  } else {
    pendingCandidates.push(candidate);
  }
};

export const flushCandidates = async () => {
  for (const candidate of pendingCandidates) {
    try {
      await peer?.addIceCandidate(candidate);
    } catch (err) {
      console.error("Error flushing ICE candidates:", err);
    }
  }
  pendingCandidates = [];
};
