import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../SocketIo/SocketIo";
import {
  callActions,
  peerActions,
  videoActions,
} from "@/store/slices/callSlice";
import { addCandidateSafely, flushCandidates, getPeer } from "./Peer";
import {
  Camera,
  Mic,
  MicOff,
  PhoneMissed,
  Video,
  VideoOff,
} from "lucide-react";
import { useOnHangUpCall } from "@/hooks/useOnHangUpCall";

export default function CallOverLay(props: any) {
  const dispatch = useDispatch();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const mainScreenRef = useRef<HTMLDivElement>(null);
  const localScreenRef = useRef<HTMLDivElement>(null);
  const video = useSelector((state: any) => state.video);

  const localVideoRef = useRef<HTMLVideoElement>(null); // Local box
  const localMainVideoRef = useRef<HTMLVideoElement>(null); // Main screen fallback
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const { handleHangUpCall } = useOnHangUpCall({ currentMobile });
  const [isDragging, setIsDragging] = useState(false);
  const offerAanswer = useSelector((state: any) => state.peer);

  // Handle signaling events
  useEffect(() => {
    const peer = getPeer(props.mobile);
    const socket = getSocket(currentMobile);

    socket.on("call-answer", async (data) => {
      
      dispatch(peerActions.setAnswer(data));
      if (peer.signalingState === "have-local-offer") {
        
        await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
        await flushCandidates();
        dispatch(callActions.acceptCall());
      } else {
              }
    });

    socket.on("ice-candidate", async (data) => {
      
      await addCandidateSafely(data.candidate);
    });

    return () => {
      socket.off("call-answer");
      socket.off("ice-candidate");
    };
  }, [dispatch, currentMobile]);

  // Position local box initially
  useEffect(() => {
    if (mainScreenRef.current && localScreenRef.current) {
      const container = mainScreenRef.current.getBoundingClientRect();
      const box = localScreenRef.current.getBoundingClientRect();
      setPosition({
        x: container.width - box.width - 10,
        y: container.height - box.height - 10,
      });
    }
  }, []);

  // Handle dragging
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging || !mainScreenRef.current || !localScreenRef.current)
        return;

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

  // Assign local video streams
  useEffect(() => {
    if (video.localStream) {
      if (localMainVideoRef.current)
        localMainVideoRef.current.srcObject = video.localStream;
      if (localVideoRef.current)
        localVideoRef.current.srcObject = video.localStream;
    }
  }, [video.localStream]);

  // Assign remote video
  useEffect(() => {
    if (video.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = video.remoteStream;
    }
  }, [video.remoteStream]);

  useEffect(() => {
    if (video.remoteStream) {
      const peer = getPeer(props.mobile);
      let tt = peer
        .getSenders()
        .filter((sender) => sender.track?.kind === "audio");
          }
  }, [video.remoteStream]);
  // Re-assign local video when remote stream appears
  useEffect(() => {
    if (video.remoteStream && video.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = video.localStream;
    }
  }, [video.remoteStream]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!localScreenRef.current) return;
    setIsDragging(true);
    const box = localScreenRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - box.left,
      y: e.clientY - box.top,
    };
  };
  useEffect(() => {
    const socket = getSocket(currentMobile);
    socket.on("end-call", (data) => {
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
    setIsDragging(false);

    // Clear video elements
    if (localMainVideoRef.current) localMainVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (mainScreenRef.current) mainScreenRef.current = null;

    // Reset peer
    const peer = getPeer(currentMobile);
    peer.getSenders().forEach((sender) => {
      try {
        peer.removeTrack(sender);
      } catch (e) {}
    });
    peer.close();
  });
  }, []);
  const toggleAudio = () => {
    if (video.localStream) {
      video.localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (video.localStream) {
      video.localStream.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled((prev) => !prev);
    }
  };
  const handleEndCall = () => {
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
    setIsDragging(false);

    // Clear video elements
    if (localMainVideoRef.current) localMainVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (mainScreenRef.current) mainScreenRef.current = null;

    // Reset peer
    const peer = getPeer(currentMobile);
    peer.getSenders().forEach((sender) => {
      try {
        peer.removeTrack(sender);
      } catch (e) {}
    });
    peer.close(); // important

    // Emit event to other peer
    const socket = getSocket(currentMobile);
    const getRoomId = (userA: string, userB: string) =>
      [userA, userB].sort().join("_");
    const currentRoomId = getRoomId(currentMobile, props.mobile);

    socket.emit("end-call", {
      sender: currentMobile,
      receiver: props.mobile,
      roomId: currentRoomId,
    });
  };
  useEffect(() => {
    const socket = getSocket(currentMobile);
    socket.on("hangup-call", () => {
      handleHangUpCall();
    });

    return () => {
      socket.off("hangup-call");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 w-full bg-gray-200 h-full">
      <div
        ref={mainScreenRef}
        className="fixed inset-0 z-40 bg-black m-2 rounded flex items-center justify-center overflow-hidden"
      >
        {/* Main Screen: Show remote if available, otherwise local */}
        <video
          ref={remoteVideoRef}
          playsInline
          autoPlay
          muted={false}
          className="h-full w-full object-cover"
          style={{ display: video.remoteStream ? "block" : "none" }}
        ></video>

        {!video.remoteStream && (
          <video
            ref={localMainVideoRef} // Separate ref for fallback
            playsInline
            muted={true}
            autoPlay
            className="h-full w-full object-cover"
          ></video>
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
              muted={true}
              autoPlay
              className="h-full w-full object-cover"
            ></video>
          </div>
        )}
        <div className="absolute w-[80%] z-50 flex flex-row p-2 items-center justify-evenly bottom-0">
          <div
            onClick={toggleAudio}
            className="p-2 rounded-full border hover:scale-110 transition"
          >
            {isAudioEnabled ? <Mic color="white" /> : <MicOff color="gray" />}
          </div>
          <div onClick={handleEndCall} className="p-3 rounded-full bg-red-600">
            <PhoneMissed color="white" />
          </div>
          <div
            onClick={toggleVideo}
            className={`p-2 rounded-full border  hover:scale-110 transition`}
          >
            {isVideoEnabled ? (
              <Video color="white" />
            ) : (
              <VideoOff color="gray" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
