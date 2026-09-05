import { store } from "@/store";
import { config } from "../google.stun";
import { getSocket } from "../SocketIo/SocketIo";
import { videoActions } from "@/store/slices/callSlice";

let peer: RTCPeerConnection | null = null;
let pendingCandidates: RTCIceCandidateInit[] = [];

export const getPeer = (mobile?: string) => {
  if (!peer || peer.signalingState === "closed") {
    peer = new RTCPeerConnection(config);

    const remoteStream = new MediaStream();
    peer.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
      store.dispatch(videoActions.setRemoteStream(remoteStream));
    };

    peer.onicecandidate = (event) => {
      if (!event.candidate || !mobile) return;

      const currentMobile = store.getState().auth.currentMobile;
      const roomId = [mobile, currentMobile].sort().join("_");
      const socket = getSocket(currentMobile);
      socket.emit("ice-candidate", {
        sender: currentMobile,
        receiver: mobile,
        roomId,
        candidate: event.candidate,
      });
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
  pendingCandidates = [];
};

export const addCandidateSafely = async (candidate: RTCIceCandidateInit) => {
  if (peer && peer.remoteDescription) {
    try {
      await peer.addIceCandidate(candidate);
    } catch {
      // ignore duplicate or late candidates
    }
  } else {
    pendingCandidates.push(candidate);
  }
};

export const flushCandidates = async () => {
  for (const candidate of pendingCandidates) {
    try {
      await peer?.addIceCandidate(candidate);
    } catch {
      // ignore duplicate or late candidates
    }
  }
  pendingCandidates = [];
};
