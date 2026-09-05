import { callActions, peerActions, videoActions } from "@/store/slices/callSlice";
import { acquireLocalStream } from "@/utils/callRelated/callMedia";
import { getPeer } from "@/utils/callRelated/Peer";
import { teardownCall } from "@/utils/callRelated/teardownCall";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { CircleX } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export type UseVideoCallParams = {
  mobile: string;
  currentMobile: string;
};

export const useHandleVCall = ({ mobile, currentMobile }: UseVideoCallParams) => {
  const dispatch = useDispatch();

  const handleVCall = async () => {
    if (!currentMobile || !mobile || currentMobile === mobile) {
      toast.error("Cannot start a call with this contact.");
      return;
    }

    teardownCall();

    const peer = getPeer(mobile);
    const socket = getSocket(currentMobile);

    try {
      const stream = await acquireLocalStream();
      dispatch(videoActions.setLocalStream(stream));
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      const roomId = [mobile, currentMobile].sort().join("_");
      const offerData = {
        sender: currentMobile,
        receiver: mobile,
        offer,
        roomId,
      };

      dispatch(peerActions.setOffer(offerData));
      dispatch(callActions.initiateCall());
      socket.emit("call-offer", offerData);
    } catch (error: any) {
      teardownCall();

      if (error.name === "NotAllowedError") {
        toast.error("Please allow camera and microphone access.");
      } else if (error.name === "NotFoundError") {
        toast.error("No camera or microphone found on this device.");
      } else if (error.name === "NotReadableError") {
        toast.error("Camera or microphone is already in use.");
      } else {
        toast.error("Could not start the video call.");
      }
    }
  };

  return { handleVCall };
};
