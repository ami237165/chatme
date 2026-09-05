"use client";

import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../SocketIo/SocketIo";
import { callActions, peerActions, videoActions } from "@/store/slices/callSlice";
import { acquireLocalStream } from "./callMedia";
import { flushCandidates, getPeer } from "./Peer";
import { teardownCall } from "./teardownCall";

type IncomingCallOverlayProps = {
  mobile: string;
  currentMobile: string;
};

export default function IncomingCallOverlay({
  mobile,
  currentMobile,
}: IncomingCallOverlayProps) {
  const dispatch = useDispatch();
  const peerState = useSelector((state: any) => state.peer);
  const callStatus = useSelector((state: any) => state.call.status);

  const handleReject = () => {
    const offer = peerState.offer;
    if (!offer) {
      teardownCall();
      return;
    }

    const socket = getSocket(currentMobile);
    socket.emit("hangup-call", {
      sender: currentMobile,
      receiver: offer.sender,
      roomId: offer.roomId,
    });
    teardownCall();
  };

  const handleAccept = async () => {
    const offer = peerState.offer;
    if (!offer) return;

    try {
      const peer = getPeer(offer.sender);
      const stream = await acquireLocalStream();

      dispatch(videoActions.setLocalStream(stream));
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      await peer.setRemoteDescription(new RTCSessionDescription(offer.offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      const answerData = {
        sender: currentMobile,
        receiver: offer.sender,
        answer,
        roomId: offer.roomId,
      };

      dispatch(peerActions.setAnswer(answerData));

      const socket = getSocket(currentMobile);
      socket.emit("call-answer", answerData);
      await flushCandidates();
      dispatch(callActions.acceptCall());
    } catch {
      teardownCall();
    }
  };

  const statusLabel =
    callStatus === "connected" ? "Connecting..." : "Incoming Call";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-slideUp">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden" />
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          {statusLabel}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{mobile} is calling...</p>
        <div className="flex justify-center gap-8">
          <button
            onClick={handleReject}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-md transition"
          >
            ❌
          </button>
          <button
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-md transition"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
