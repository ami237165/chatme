import {
  callActions,
  peerActions,
  videoActions,
} from "@/store/slices/callSlice";
import { getPeer } from "@/utils/callRelated/Peer";
import { useDispatch } from "react-redux";
export type UseVideoCallParams = {
  mobile: string;
  currentMobile: string;
};
export const useOnCallOffer = ({
  mobile,
  currentMobile,
}: UseVideoCallParams) => {
  const dispatch = useDispatch();
  const useCallOffer = async (data) => {
    const peer = getPeer(mobile);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert("Your browser doesn't support camera/mic or connection is not secure (HTTPS required).");
  return;
}

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1, // single channel for mobile devices
        sampleRate: 48000, // better audio quality
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    dispatch(videoActions.setLocalStream(stream));
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
    dispatch(peerActions.setOffer(data));

    const answer = await peer.createAnswer();
    let answerData = {
      sender: currentMobile,
      receiver: data.sender,
      answer: answer,
      roomId: data.roomId,
    };
    await peer.setLocalDescription(answer);
    dispatch(peerActions.setAnswer(answerData));

    // Show incoming call UI
    dispatch(callActions.incomingCall());
  };
  return { useCallOffer };
};
