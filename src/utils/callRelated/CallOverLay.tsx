import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket } from "../SocketIo/SocketIo";
import {
  Mic,
  MicOff,
  PhoneMissed,
  Video,
  VideoOff,
} from "lucide-react";
import { clearVideoElements, teardownCall } from "./teardownCall";

type CallOverLayProps = {
  mobile: string;
  currentMobile: string;
};

export default function CallOverLay({ mobile, currentMobile }: CallOverLayProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const mainScreenRef = useRef<HTMLDivElement>(null);
  const localScreenRef = useRef<HTMLDivElement>(null);
  const video = useSelector((state: any) => state.video);
  const callStatus = useSelector((state: any) => state.call.status);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localMainVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (mainScreenRef.current && localScreenRef.current) {
      const container = mainScreenRef.current.getBoundingClientRect();
      const box = localScreenRef.current.getBoundingClientRect();
      setPosition({
        x: container.width - box.width - 10,
        y: container.height - box.height - 10,
      });
    }
  }, [video.remoteStream]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !mainScreenRef.current || !localScreenRef.current) {
        return;
      }

      const container = mainScreenRef.current.getBoundingClientRect();
      const box = localScreenRef.current.getBoundingClientRect();

      let newX = e.clientX - container.left - dragOffset.current.x;
      let newY = e.clientY - container.top - dragOffset.current.y;

      newX = Math.max(0, Math.min(newX, container.width - box.width));
      newY = Math.max(0, Math.min(newY, container.height - box.height));

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => setIsDragging(false);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (video.localStream) {
      if (localMainVideoRef.current) {
        localMainVideoRef.current.srcObject = video.localStream;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = video.localStream;
      }
    }
  }, [video.localStream]);

  useEffect(() => {
    if (video.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = video.remoteStream;
    }
  }, [video.remoteStream]);

  useEffect(() => {
    if (video.remoteStream && video.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = video.localStream;
    }
  }, [video.remoteStream, video.localStream]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!localScreenRef.current) return;
    setIsDragging(true);
    const box = localScreenRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - box.left,
      y: e.clientY - box.top,
    };
  };

  const toggleAudio = () => {
    video.localStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !track.enabled;
    });
    setIsAudioEnabled((prev) => !prev);
  };

  const toggleVideo = () => {
    video.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !track.enabled;
    });
    setIsVideoEnabled((prev) => !prev);
  };

  const handleEndCall = () => {
    const socket = getSocket(currentMobile);
    const roomId = [mobile, currentMobile].sort().join("_");

    socket.emit("end-call", {
      sender: currentMobile,
      receiver: mobile,
      roomId,
    });

    clearVideoElements([
      localMainVideoRef.current,
      localVideoRef.current,
      remoteVideoRef.current,
    ]);
    teardownCall();
  };

  const statusLabel =
    callStatus === "connected"
      ? "Connected"
      : callStatus === "calling"
        ? "Calling..."
        : "On call";

  return (
    <div className="fixed inset-0 z-50 w-full bg-gray-200 h-full">
      <div
        ref={mainScreenRef}
        className="fixed inset-0 z-40 bg-black m-2 rounded flex items-center justify-center overflow-hidden"
      >
        <div className="absolute top-4 left-4 z-50 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
          {statusLabel}
        </div>

        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          muted={false}
          className="h-full w-full object-cover"
          style={{ display: video.remoteStream ? "block" : "none" }}
        />

        {!video.remoteStream && (
          <video
            ref={localMainVideoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />
        )}

        {video.remoteStream && (
          <div
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              touchAction: "none",
              cursor: "grab",
            }}
            ref={localScreenRef}
            onPointerDown={handlePointerDown}
            className="absolute rounded-xl w-[35%] h-[30%] bottom-4 right-4 z-50 overflow-hidden shadow-lg border-2 border-white cursor-grab"
          >
            <video
              ref={localVideoRef}
              playsInline
              muted
              autoPlay
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="absolute w-[80%] z-50 flex flex-row p-2 items-center justify-evenly bottom-0">
          <button
            type="button"
            onClick={toggleAudio}
            className="p-2 rounded-full border hover:scale-110 transition"
          >
            {isAudioEnabled ? <Mic color="white" /> : <MicOff color="gray" />}
          </button>
          <button
            type="button"
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600"
          >
            <PhoneMissed color="white" />
          </button>
          <button
            type="button"
            onClick={toggleVideo}
            className="p-2 rounded-full border hover:scale-110 transition"
          >
            {isVideoEnabled ? (
              <Video color="white" />
            ) : (
              <VideoOff color="gray" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
