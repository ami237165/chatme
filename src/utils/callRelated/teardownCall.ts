import { store } from "@/store";
import {
  callActions,
  peerActions,
  videoActions,
} from "@/store/slices/callSlice";
import { resetPeer } from "./Peer";

export function stopStream(stream: MediaStream | null | undefined) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function teardownCall() {
  const { video } = store.getState();

  stopStream(video.localStream);
  stopStream(video.remoteStream);
  resetPeer();

  store.dispatch(videoActions.clearStreams());
  store.dispatch(peerActions.clearPeer());
  store.dispatch(callActions.endCall());
}

export function clearVideoElements(
  refs: Array<HTMLVideoElement | null | undefined>,
) {
  refs.forEach((element) => {
    if (element) element.srcObject = null;
  });
}
