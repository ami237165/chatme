import { callActions, videoActions } from "@/store/slices/callSlice";
import { getPeer } from "@/utils/callRelated/Peer";
import { useDispatch, useSelector } from "react-redux";
// export type UseVideoCallParams = {
//   mobile: string;
//   currentMobile: string;
// };
export const useOnHangUpCall = ({
  currentMobile,
}: any) => {

  const dispatch = useDispatch();
    const video = useSelector((state: any) => state.video);
  const handleHangUpCall = async () => {
    dispatch(callActions.endCall());

    if (video.localStream) {
      video.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      // CLEAR local stream in Redux
      dispatch(videoActions.setLocalStream(null));
    }

    if (video.remoteStream) {
      video.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      // CLEAR remote stream in Redux
      dispatch(videoActions.setRemoteStream(null));
    }

    // Reset peer
    const peer = getPeer(currentMobile);
    peer.getSenders().forEach((sender) => {
      try {
        peer.removeTrack(sender);
      } catch (e) {}
    });
    peer.close();
  };
  return { handleHangUpCall };
};
