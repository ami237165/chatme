"use client";
import { useEffect, useRef, useState } from "react";
import "./customTailwind.css";
import { useDispatch, useSelector } from "react-redux";
import { callActions, videoActions } from "@/store/slices/callSlice";
import { getSocket } from "../SocketIo/SocketIo";
import { flushCandidates, getPeer } from "./Peer";
export default function IncomingCallOverlay(props: any) {
  const dispatch = useDispatch();
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const offerAanswer = useSelector((state: any) => state.peer);
  const video = useSelector((state: any) => state.video);

  console.log("offerAanswer on incomming b ,", offerAanswer);

  const handleReject = () => {
    const socket = getSocket(currentMobile);

    let roomId = [offerAanswer.offer.sender, currentMobile].sort().join("_");
    // Send the answer back to Caller
    socket.emit("hangup-call", {
      sender: currentMobile,
      receiver: offerAanswer.offer.sender,
      roomId: roomId,
    });
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
    const peer = getPeer(props.mobile);
    peer.getSenders().forEach((sender) => {
      try {
        peer.removeTrack(sender);
      } catch (e) {}
    });
    peer.close();
  };
  const handleAccept = async () => {
    const socket = getSocket(currentMobile);
    // Send the answer back to Caller
    socket.emit("call-answer", {
      sender: currentMobile,
      receiver: offerAanswer.answer.receiver,
      answer: offerAanswer.answer.answer,
      roomId: offerAanswer.answer.roomId,
    });

    // Apply ICE candidates now
    await flushCandidates();

    dispatch(callActions.acceptCall());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-slideUp">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden">
          {/* <img
            src="/caller-avatar.png"
            alt="Caller"
            className="w-full h-full object-cover"
          /> */}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Incoming Call
        </h2>
        <p className="text-lg text-gray-600 mb-6">John Doe is calling...</p>
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
