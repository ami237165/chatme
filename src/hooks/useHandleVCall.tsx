import { callActions, peerActions, videoActions } from "@/store/slices/callSlice";
import { getPeer } from "@/utils/callRelated/Peer";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { CircleX } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
export type UseVideoCallParams = {
  mobile: string;
  currentMobile: string;
};
export const useHandleVCall = ({ mobile, currentMobile }: UseVideoCallParams) =>{
    const dispatch = useDispatch()
    // Initiate call
  const handleVCall = async () => {
    const peer = getPeer(mobile);
        const socket = getSocket(currentMobile);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  toast.error("Your browser doesn't support camera/mic or connection is not secure (HTTPS required).");
  return;
}

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
        },
      });

      if (!stream) throw new Error("Could not capture user media");

      dispatch(videoActions.setLocalStream(stream));

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      let roomId = [mobile, currentMobile].sort().join("_");
      const offerData = {
        sender: currentMobile,
        receiver: mobile,
        offer,
        roomId,
      };

      dispatch(peerActions.setOffer(offerData));
      socket.emit("call-offer", offerData);

      dispatch(callActions.initiateCall());
    } catch (error: any) {
      

      let errorMsg = "Something went wrong while trying to access media.";

      if (error.name === "NotAllowedError") {
        errorMsg = "Please Provide Permission to access camera/microphone.";
        toast(errorMsg, {
          duration: 3000,
          position: "top-center",
          icon: <CircleX color="red" />,
          className:
            " className: 'bg-red-600 text-white px-4 py-2 rounded-md shadow-lg'",
          iconTheme: {
            primary: "#ffffff",
            secondary: "#ef4444",
          },
        });
      } else if (error.name === "NotFoundError") {
        errorMsg = "No media device found. Please check your camera and mic.";
        toast(errorMsg, {
          duration: 3000,
          position: "top-center",
          icon: <CircleX color="red" />,
          className:
            " className: 'bg-red-600 text-white px-4 py-2 rounded-md shadow-lg'",
          iconTheme: {
            primary: "#ffffff",
            secondary: "#ef4444",
          },
        });
      } else if (error.name === "NotReadableError") {
        errorMsg = "Camera or microphone is already in use.";
        toast(errorMsg, {
          duration: 3000,
          position: "top-center",
          icon: <CircleX color="red" />,
          className:
            " className: 'bg-red-600 text-white px-4 py-2 rounded-md shadow-lg'",
          iconTheme: {
            primary: "#ffffff",
            secondary: "#ef4444",
          },
        });
      }
      dispatch(callActions.endCall());
    }
  };

  return {handleVCall};
}