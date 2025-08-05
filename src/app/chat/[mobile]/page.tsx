"use client";
import ProtectedRoutes from "@/utils/ProtectedRoutes";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { useViewportHeight } from "@/utils/useViewportHeight";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  callActions,
  peerActions,
  videoActions,
} from "@/store/slices/callSlice";
import Call from "@/components/Call";
import {
  addCandidateSafely,
  getPeer,
  resetPeer,
} from "@/utils/callRelated/Peer";
import { v4 as uuidv4 } from "uuid";
import toast, { Toaster } from "react-hot-toast";
import { addMessage } from "@/store/slices/message.slice";
import { RootState } from "@/store";
import {
  FileAttachment,
  MessageData,
} from "@/interfaces/meseage_related/messageInterFace";
// import { prepareMessageForRedux } from "@/utils/reduxMsgParser";
import { selectMessagesByRoomId } from "@/utils/selectors/messages";
import { ArrowLeft, CircleX } from "lucide-react";
import { getMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";
import { MediaPreviewLoader } from "@/components/MediaPreviewLoader";
import { MediaPreview } from "@/components/MediaPreview";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";

const ChatPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const [isClient, setIsClient] = useState(false);
  let { mobile }: any = useParams();
  let contact = useSelector((state: any) => state.auth.contacts);
  let name = contact?.filter((user: any) => user?.mobileNumber == mobile)[0]
    ?.name;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const video = useSelector((state: any) => state.video);

  const getRoomId = (userA: string, userB: string) =>
    [userA, userB].sort().join("_");
  const currentRoomId = getRoomId(currentMobile, mobile);
  const roomId = useMemo(
    () => getRoomId(currentMobile, mobile),
    [currentMobile, mobile]
  );

  const messages = useSelector(selectMessagesByRoomId(roomId));

  const [pendingFiles, setPendingFiles] = useState<FileAttachment[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log("SOCKET_URL:", process.env.NEXT_PUBLIC_SOCKET_URL);
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  }, [messages]);

  // Helper to get roomId
  useViewportHeight();
  useEffect(() => {
    let roomId = [mobile, currentMobile].sort().join("_");
    let socket = getSocket(currentMobile);
    socket.emit("join-room", roomId);
  }, []);
  useEffect(() => {
    const dataEstimater = async () => {
      if (navigator.storage && (await navigator.storage.estimate())) {
        const quota = await navigator.storage.estimate();
        const percentageUsed = (quota.usage! / quota.quota!) * 100;
        console.log(` you have used ${percentageUsed} of the total storage`);
        const remaining = (quota.quota! - quota.usage!) / 1024 / 1024;
        console.log(` you can write ${remaining} more mb`);
      }
    };
    dataEstimater();
    console.log("hhhhhhhhhhhhh ,", messages);
  }, [messages]);
  useEffect(() => {
    setIsClient(true);
    const socket = getSocket(currentMobile);
    if (!socket.connected) socket.connect();

    socket.on("connect", () => console.log("Connected to socket:", socket.id));

    // Receiving message
    socket.on("receive_message", async (data) => {
      console.log("Received message::", data);
      const roomId = data.data.roomId;
      await handleNewMessage(roomId, data.data);
    });

    // Incoming call offer
    socket.on("call-offer", async (data) => {
      console.log("call offer data ,", data);

      const peer = getPeer(mobile);
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
    });

    // ICE candidates
    socket.on("ice-candidate", async (data) => {
      await addCandidateSafely(data.candidate);
    });

    socket.on("hangup-call", (data) => {
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
    });

    return () => {
      socket.off("call-offer");
      socket.off("receive_message");

      socket.off("ice-candidate");
      socket.off("end-call");
    };
  }, []);

  // Initiate call
  const handleVCall = async () => {
    const peer = getPeer(mobile);
    const socket = getSocket(currentMobile);
    try {
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
      console.error("WebRTC Call Error:", error);

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
  const handleNewMessage = async (roomId: any, msg: MessageData) => {
    if (msg.hasFiles && msg.files?.length) {
      for (const file of msg.files) {
        if (file.fileData) {
          let arrayBuffer;

          if (file.fileData instanceof File) {
            arrayBuffer = await file.fileData.arrayBuffer();
          } else if (file.fileData instanceof Uint8Array) {
            arrayBuffer = file.fileData.buffer.slice(
              file.fileData.byteOffset,
              file.fileData.byteOffset + file.fileData.byteLength
            );
          } else if (file.fileData instanceof ArrayBuffer) {
            arrayBuffer = file.fileData;
          } else {
            console.warn("Unsupported fileData type", file.fileData);
            continue;
          }
          try {
            await saveMediaToIndexedDB(file.fileId, arrayBuffer);
          } catch (error) {
            console.log("Failed to save to IndexedDB:,", error);
          }

          delete file.fileData; // ✅ Clean up for Redux
          delete file?.previewUrl;
        }
      }
    }

    dispatch(addMessage({ roomId, message: msg }));
  };

  if (!isClient) return null;
  // Trigger hidden file input
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  //handle file change

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const convertToPreview = async (file: File): Promise<FileAttachment> => {
      const fileId = `file_${crypto.randomUUID()}`; // ✅ Unique ID
      const blobUrl = URL.createObjectURL(file); // ✅ For preview
      console.log("ffffffffffffffffff ,", file);
      try {
        await saveMediaToIndexedDB(fileId, file);
      } catch (error) {
        console.log("Failed to save to IndexedDB:,", error);
      }
      // await saveMediaToIndexedDB(fileId, file); // ✅ Save to IndexedDB

      return {
        fileName: file.name,
        fileType: file.type,
        previewUrl: blobUrl,
        fileData: file,
        fileId: fileId, // ✅ store just ID (reference)
      };
    };

    try {
      const results = await Promise.all(
        Array.from(files).map((file) => convertToPreview(file))
      );

      setPendingFiles((prev) => [...prev, ...results]);

      // Reset input value
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error generating preview:", err);
    }
  };

  const handleRemoveFile = (index: number) => {
    const removedFile = pendingFiles[index];
    URL.revokeObjectURL(removedFile.previewUrl);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlesendMessage = () => {
    console.log("pendingFiles ,", pendingFiles.length);

    if (input.trim() === "" && pendingFiles.length === 0) return;
    const msg: MessageData = {
      id: uuidv4(),
      sender: currentMobile,
      receiver: mobile,
      text: input.trim() === "" ? null : input.trim(),
      hasText: input.trim() !== "",
      hasFiles: pendingFiles.length > 0,
      files: pendingFiles.length > 0 ? pendingFiles : undefined,
      timestamp: Date.now(),
      roomId: currentRoomId,
    };

    sendMessage(msg);
    // Reset input and files
    setInput("");
    setPendingFiles([]);
  };
  //send msg
  const sendMessage = async (msg: MessageData) => {
    console.log("inside send msg");

    const socket = getSocket(currentMobile);

    socket.emit("send_message", msg);
    await handleNewMessage(msg.roomId, msg);
    setInput("");
  };

  const handleBackToChatList = () => {
    router.back(); // replace with your actual route
  };
  if (!isClient) return null;

  return (
    <AnimatedPageWrapper>
      <ProtectedRoutes>
        <Toaster position="top-center" reverseOrder={false} />
        <div
          className="main flex flex-col h-screen max-h-scree"
          style={{
            height: "var(--vh)",
            backgroundColor: "#aabdb1",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'%3E%3Cpath fill='%23d4e4d8' fill-opacity='0.37' d='M192 15v2a11 11 0 0 0-11 11c0 1.94 1.16 4.75 2.53 6.11l2.36 2.36a6.93 6.93 0 0 1 1.22 7.56l-.43.84a8.08 8.08 0 0 1-6.66 4.13H145v35.02a6.1 6.1 0 0 0 3.03 4.87l.84.43c1.58.79 4 .4 5.24-.85l2.36-2.36a12.04 12.04 0 0 1 7.51-3.11 13 13 0 1 1 .02 26 12 12 0 0 1-7.53-3.11l-2.36-2.36a4.93 4.93 0 0 0-5.24-.85l-.84.43a6.1 6.1 0 0 0-3.03 4.87V143h35.02a8.08 8.08 0 0 1 6.66 4.13l.43.84a6.91 6.91 0 0 1-1.22 7.56l-2.36 2.36A10.06 10.06 0 0 0 181 164a11 11 0 0 0 11 11v2a13 13 0 0 1-13-13 12 12 0 0 1 3.11-7.53l2.36-2.36a4.93 4.93 0 0 0 .85-5.24l-.43-.84a6.1 6.1 0 0 0-4.87-3.03H145v35.02a8.08 8.08 0 0 1-4.13 6.66l-.84.43a6.91 6.91 0 0 1-7.56-1.22l-2.36-2.36A10.06 10.06 0 0 0 124 181a11 11 0 0 0-11 11h-2a13 13 0 0 1 13-13c2.47 0 5.79 1.37 7.53 3.11l2.36 2.36a4.94 4.94 0 0 0 5.24.85l.84-.43a6.1 6.1 0 0 0 3.03-4.87V145h-35.02a8.08 8.08 0 0 1-6.66-4.13l-.43-.84a6.91 6.91 0 0 1 1.22-7.56l2.36-2.36A10.06 10.06 0 0 0 107 124a11 11 0 0 0-22 0c0 1.94 1.16 4.75 2.53 6.11l2.36 2.36a6.93 6.93 0 0 1 1.22 7.56l-.43.84a8.08 8.08 0 0 1-6.66 4.13H49v35.02a6.1 6.1 0 0 0 3.03 4.87l.84.43c1.58.79 4 .4 5.24-.85l2.36-2.36a12.04 12.04 0 0 1 7.51-3.11A13 13 0 0 1 81 192h-2a11 11 0 0 0-11-11c-1.94 0-4.75 1.16-6.11 2.53l-2.36 2.36a6.93 6.93 0 0 1-7.56 1.22l-.84-.43a8.08 8.08 0 0 1-4.13-6.66V145H11.98a6.1 6.1 0 0 0-4.87 3.03l-.43.84c-.79 1.58-.4 4 .85 5.24l2.36 2.36a12.04 12.04 0 0 1 3.11 7.51A13 13 0 0 1 0 177v-2a11 11 0 0 0 11-11c0-1.94-1.16-4.75-2.53-6.11l-2.36-2.36a6.93 6.93 0 0 1-1.22-7.56l.43-.84a8.08 8.08 0 0 1 6.66-4.13H47v-35.02a6.1 6.1 0 0 0-3.03-4.87l-.84-.43c-1.59-.8-4-.4-5.24.85l-2.36 2.36A12 12 0 0 1 28 109a13 13 0 1 1 0-26c2.47 0 5.79 1.37 7.53 3.11l2.36 2.36a4.94 4.94 0 0 0 5.24.85l.84-.43A6.1 6.1 0 0 0 47 84.02V49H11.98a8.08 8.08 0 0 1-6.66-4.13l-.43-.84a6.91 6.91 0 0 1 1.22-7.56l2.36-2.36A10.06 10.06 0 0 0 11 28 11 11 0 0 0 0 17v-2a13 13 0 0 1 13 13c0 2.47-1.37 5.79-3.11 7.53l-2.36 2.36a4.94 4.94 0 0 0-.85 5.24l.43.84A6.1 6.1 0 0 0 11.98 47H47V11.98a8.08 8.08 0 0 1 4.13-6.66l.84-.43a6.91 6.91 0 0 1 7.56 1.22l2.36 2.36A10.06 10.06 0 0 0 68 11 11 11 0 0 0 79 0h2a13 13 0 0 1-13 13 12 12 0 0 1-7.53-3.11l-2.36-2.36a4.93 4.93 0 0 0-5.24-.85l-.84.43A6.1 6.1 0 0 0 49 11.98V47h35.02a8.08 8.08 0 0 1 6.66 4.13l.43.84a6.91 6.91 0 0 1-1.22 7.56l-2.36 2.36A10.06 10.06 0 0 0 85 68a11 11 0 0 0 22 0c0-1.94-1.16-4.75-2.53-6.11l-2.36-2.36a6.93 6.93 0 0 1-1.22-7.56l.43-.84a8.08 8.08 0 0 1 6.66-4.13H143V11.98a6.1 6.1 0 0 0-3.03-4.87l-.84-.43c-1.59-.8-4-.4-5.24.85l-2.36 2.36A12 12 0 0 1 124 13a13 13 0 0 1-13-13h2a11 11 0 0 0 11 11c1.94 0 4.75-1.16 6.11-2.53l2.36-2.36a6.93 6.93 0 0 1 7.56-1.22l.84.43a8.08 8.08 0 0 1 4.13 6.66V47h35.02a6.1 6.1 0 0 0 4.87-3.03l.43-.84c.8-1.59.4-4-.85-5.24l-2.36-2.36A12 12 0 0 1 179 28a13 13 0 0 1 13-13zM84.02 143a6.1 6.1 0 0 0 4.87-3.03l.43-.84c.8-1.59.4-4-.85-5.24l-2.36-2.36A12 12 0 0 1 83 124a13 13 0 1 1 26 0c0 2.47-1.37 5.79-3.11 7.53l-2.36 2.36a4.94 4.94 0 0 0-.85 5.24l.43.84a6.1 6.1 0 0 0 4.87 3.03H143v-35.02a8.08 8.08 0 0 1 4.13-6.66l.84-.43a6.91 6.91 0 0 1 7.56 1.22l2.36 2.36A10.06 10.06 0 0 0 164 107a11 11 0 0 0 0-22c-1.94 0-4.75 1.16-6.11 2.53l-2.36 2.36a6.93 6.93 0 0 1-7.56 1.22l-.84-.43a8.08 8.08 0 0 1-4.13-6.66V49h-35.02a6.1 6.1 0 0 0-4.87 3.03l-.43.84c-.79 1.58-.4 4 .85 5.24l2.36 2.36a12.04 12.04 0 0 1 3.11 7.51A13 13 0 1 1 83 68a12 12 0 0 1 3.11-7.53l2.36-2.36a4.93 4.93 0 0 0 .85-5.24l-.43-.84A6.1 6.1 0 0 0 84.02 49H49v35.02a8.08 8.08 0 0 1-4.13 6.66l-.84.43a6.91 6.91 0 0 1-7.56-1.22l-2.36-2.36A10.06 10.06 0 0 0 28 85a11 11 0 0 0 0 22c1.94 0 4.75-1.16 6.11-2.53l2.36-2.36a6.93 6.93 0 0 1 7.56-1.22l.84.43a8.08 8.08 0 0 1 4.13 6.66V143h35.02z'%3E%3C/path%3E%3C/svg%3E")`,
          }}
        >
          {/* header started */}
          <div className="header-body shadow-md shadow-gray-300 z-10 bg-gray-700 flex items-center justify-between px-1 py-1">
            {/* Back Button */}
            <div className="flex-none pr-1">
              <div className="cursor-pointer" onClick={handleBackToChatList}>
                <ArrowLeft className="text-gray-100" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-2 flex-grow">
              <div
                className="w-10 h-10 bg-gray-300 rounded-full"
                onClick={() => router.push("/profile")}
              />
              <div className="flex flex-col">
                <h2 className="text-lg text-gray-100">{name}</h2>
                <p className="text-sm text-gray-300">Online</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              <div
                onClick={handleVCall}
                className="cursor-pointer text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              {/* <div className="cursor-pointer text-gray-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
        />
      </svg>
    </div> */}
            </div>
          </div>

          {/* header ended */}
          {/*  message body started*/}
          <div className="msg-body flex-1 p-1 overflow-scroll">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`w-fit px-4 py-2 my-1 rounded-xs break-words max-w-[80%] min-w-[3rem] shadow-gray-300 z-30 ${
                  msg.sender === currentMobile
                    ? "bg-gray-600 text-white self-end ml-auto"
                    : "bg-white text-gray-800 self-start mr-auto"
                }`}
              >
                {/* Show text */}
                {msg.text && <p>{msg.text}</p>}

                {/* Show file previews if they exist */}
                {msg.hasFiles &&
                  msg.files?.map((file, idx) => (
                    <MediaPreviewLoader key={idx} file={file} />
                  ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/*  message body ended*/}
          {/*  input body started*/}
          <div className="flex flex-col">
            {pendingFiles.length > 0 && (
              <MediaPreview files={pendingFiles} onRemove={handleRemoveFile} />
            )}
            <div className="input-main w-full flex flex-row items-center gap-1 p-1">
              <div className="input-body min-w-1 flex flex-1 rounded-full flex-row bg-gray-800 items-center justify-center py-2 px-5">
                <div className="min-w-1 text-gray-100 text-lg flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlesendMessage()}
                    placeholder="Message"
                    className="focus:outline-none"
                  />
                </div>
                <div
                  className="input-attach text-gray-300 mx-2 cursor-pointer"
                  onClick={() => handleAttachClick()}
                >
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                    />
                  </svg>
                </div>
              </div>
              <div
                onClick={() => handlesendMessage()}
                className="send text-green-300 bg-gray-800 rounded-full p-2 items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-7"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </div>
            </div>
          </div>

          {/*  input body ended*/}
          <Call mobile={mobile} />
        </div>
      </ProtectedRoutes>
    </AnimatedPageWrapper>
  );
};

export default ChatPage;
