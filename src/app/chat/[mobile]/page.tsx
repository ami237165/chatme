"use client";
import ProtectedRoutes from "@/utils/ProtectedRoutes";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { useViewportHeight } from "@/utils/useViewportHeight";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { Toaster } from "react-hot-toast";
import { MessageData } from "@/interfaces/meseage_related/messageInterFace";
import { selectMessagesByRoomId } from "@/utils/selectors/messages";
import { ArrowLeft, Check, CheckCheck, Clock, Paperclip, SendHorizontal, Video } from "lucide-react";
import { MediaPreviewLoader } from "@/components/MediaPreviewLoader";
import { MediaPreview } from "@/components/MediaPreview";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import { useHandleNewMsg } from "../../../hooks/useHandleNewMsg";
import { useHandleFileChange } from "../../../hooks/useHandleFileChange";
import { useHandleVCall } from "../../../hooks/useHandleVCall";
import { usePresence } from "@/hooks/usePresence";
import { formatLastSeen } from "@/utils/userActivity/lastSeen";
import { useConversationService, useLoadMessagesService } from "@/services/msg.service";
import { loadmsg } from "@/store/apiServices/loadMsg";
import { saveMediaToIndexedDB } from "@/lib/indexdb";
import { m } from "framer-motion";
import { useLayoutEffect } from "react";
import { RootState } from "@/store";
import { User } from "@/store/slices/friends.slice";

const ChatPage = () => {
  const router = useRouter();
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const [isClient, setIsClient] = useState(false);
  let { mobile }: any = useParams();
  let contact = useSelector((state: any) => state.auth.contacts);
  const { loadMessages } = useLoadMessagesService();
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getRoomId = (userA: string, userB: string) =>
    [userA, userB].sort().join("_");
  const currentRoomId = getRoomId(currentMobile, mobile);
  const roomId = useMemo(
    () => getRoomId(currentMobile, mobile),
    [currentMobile, mobile]
  );
  const messages = useSelector(selectMessagesByRoomId(roomId));
  const [input, setInput] = useState("");
  const { handleNewMessage } = useHandleNewMsg();
  const {
    fileInputRef,
    handleFileChange,
    pendingFiles,
    setPendingFiles,
    removedFileFromDB,
  } = useHandleFileChange();
  const { handleVCall } = useHandleVCall({ mobile, currentMobile });
  const friens = useSelector((state:RootState) => state.friends.friends)
  const currentChat:User = friens.find((f:User) => f.mobileNumber == mobile)
  const {createConvMetadata} = useConversationService();
  const presence = usePresence(currentMobile, mobile);

  useEffect(() => {
    if (!currentMobile || !mobile) return;
    loadMsg();
  }, [currentMobile, mobile]);
  const loadMsg = async () => {
    if (!currentMobile || !mobile || !roomId) return;

    const existingMsgs = messages; // from Redux

    const lastTimestamp = existingMsgs.length
      ? existingMsgs[0].timestamp
      : Date.now();

    try {
      const fetched = await loadMessages({
        roomId,
        from: Number(lastTimestamp),
        to: Date.now() - 30 * 24 * 60 * 60 * 1000,
      });

      [...fetched].reverse().forEach((msg) => {
        if (msg.hasFiles && msg.files.length !== 0) {
          msg.files?.map(
            async (file, idx) =>
              await saveMediaToIndexedDB(file.fileId, file.fileData.data)
          );
        }
        // const exists = existingMsgs.some(m => m.id === msg.id);
        handleNewMessage(roomId, msg);
      });
      requestAnimationFrame(() => {
        const el = msgContainerRef.current;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
        initialLoadDone.current = true; // 🔥 IMPORTANT
      });
    } catch (error) {}
  };

  // Helper to get roomId
  useViewportHeight();
  useEffect(() => {
    if (!messages.length) return;

    if (!initialLoadDone.current) {
      // 🔥 FIRST LOAD → NO animation
      messagesEndRef.current?.scrollIntoView({
        behavior: "auto",
      });
      initialLoadDone.current = true;
    } else {
      // 🔥 NEW MESSAGE → smooth scroll
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages.length]);

  useEffect(() => {
    setIsClient(true);
    const socket = getSocket(currentMobile);
    if (!socket.connected) socket.connect();
  }, [currentMobile]);

  if (!isClient) return null;
  // Trigger hidden file input
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = async (index: number) => {
    const removedFile = pendingFiles[index];
    URL.revokeObjectURL(removedFile.previewUrl);
    await removedFileFromDB(index);
  };

  const handlesendMessage = () => {
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
      isRead: false,
      isSent: false,
      isUploading: false,
      delivered: false,
    };

    sendMessage(msg);
    // Reset input and files
    setInput("");
    setPendingFiles([]);
  };
  //send msg
  const sendMessage = async (msg: MessageData) => {
    const socket = getSocket(currentMobile);
    // let metadata = await createConvMetadata(currentChat.connectionId);
    // if(metadata.statusCode == 201 || metadata.statusCode == 200 && metadata.success == true){
      socket.emit("send_message", msg);
    await handleNewMessage(msg.roomId, msg);

    // }else{
    //   alert("cant send msg")
    // }
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
          <div className="header-body shadow-md shadow-gray-300 z-10 bg-gray-700 flex items-center justify-between px-1 pr-2 py-1">
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
                // onClick={() => router.push("/profile")}
              />
              <div className="w-3/6 flex flex-col">
                {/* Name container with fixed height */}
                <div className="relative overflow-hidden whitespace-nowrap h-6">
                  <p className="absolute animate-marquee text-white">
                    {contact && contact.length > 0
                      ? contact?.filter(
                          (user: any) => user?.mobileNumber == mobile
                        )[0]?.name
                      : mobile}
                  </p>
                </div>

                {/* Status below */}
                <p className="text-sm text-gray-300">
                  {presence?.online && presence.online
                    ? "Online"
                    : formatLastSeen(presence.lastSeen)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              <div
                onClick={handleVCall}
                className="cursor-pointer text-gray-100"
              >
                <Video />
              </div>
            </div>
          </div>

          {/* header ended */}
          {/*  message body started*/}
          <div
            ref={msgContainerRef}
            className="msg-body flex-1 p-1 overflow-scroll"
          >
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
                {msg.text && <p>{msg.text} - {msg.delivered && msg.delivered ? <CheckCheck/> : <Check/>}</p>}
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
                    className="focus:outline-none placeholder-gray-400"
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
                  <Paperclip />
                </div>
              </div>
              <div
                onClick={() => handlesendMessage()}
                className="send text-green-300 bg-gray-800 rounded-full p-2 items-center"
              >
                <SendHorizontal />
              </div>
            </div>
          </div>

          {/*  input body ended*/}
        </div>
      </ProtectedRoutes>
    </AnimatedPageWrapper>
  );
};

export default ChatPage;
