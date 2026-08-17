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
import { ArrowLeft, Paperclip, SendHorizontal, Video } from "lucide-react";
import { MediaPreviewLoader } from "@/components/MediaPreviewLoader";
import { MediaPreview } from "@/components/MediaPreview";
import MessageTextContent from "@/components/chat/MessageTextContent";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import { useHandleNewMsg } from "../../../hooks/useHandleNewMsg";
import { useHandleFileChange } from "../../../hooks/useHandleFileChange";
import { useHandleVCall } from "../../../hooks/useHandleVCall";
import { usePresence } from "@/hooks/usePresence";
import { formatLastSeen } from "@/utils/userActivity/lastSeen";
import { useConversationService, useLoadMessagesService } from "@/services/msg.service";
import { RootState } from "@/store";
import { User } from "@/store/slices/friends.slice";
import {
  completeMessageUpload,
  getPresignedUrl,
  uploadMediaFile,
} from "@/services/media.service";
import { useUpdateMsg } from "@/hooks/useUpdatedMsg";
import toast from "react-hot-toast";
import { getMediaFromIndexedDB, saveMediaToIndexedDB } from "@/lib/indexdb";

const ChatPage = () => {
  const router = useRouter();
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const [isClient, setIsClient] = useState(false);
  let { mobile }: any = useParams();
  let contact = useSelector((state: any) => state.auth.contacts);
  const { loadMessages } = useLoadMessagesService();
  const msgContainerRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
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
  const { handleUpdateMessage, handleUpdateFileProgress } = useUpdateMsg();
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
  console.log("CHAT PAGE RENDER", mobile);

  const presence = usePresence(currentMobile, mobile);
  console.log("CHAT PAGE AFTER PRESENCE", mobile);
  const hasLoadedOnce = useRef(false);

useEffect(() => {
  if (hasLoadedOnce.current) return;      // already ran once, skip forever
  if (!currentMobile || !mobile) return;  // wait until values are ready

  hasLoadedOnce.current = true;
  loadMsg();
}, [currentMobile, mobile]);
  const loadMsg = async () => {
    if (!currentMobile || !mobile || !roomId) return;

    // const existingMsgs = messages; // from Redux
    // console.log("bbb :",messages[0].timestamp.toString());
    console.log("messages :",(messages[messages.length - 1]?.timestamp));
    
    const lastTimestamp = messages.length > 0
      ? new Date(messages[messages.length - 1].timestamp).getTime()
      : Date.now() - 30 * 24 * 60 * 60 * 1000;

    try {
      const fetched = await loadMessages({
        roomId,
        from: lastTimestamp,
        to: Date.now(),
        start:0,
        stop:100
      });
      console.log("fetched messages:", fetched);
      const fetchedMessages = fetched.data.map((m) =>
      typeof m === 'string' ? JSON.parse(m) : m
      );

      [...fetchedMessages].reverse().forEach(async (msg) => {
        await handleNewMessage(roomId, msg);
      });
      // requestAnimationFrame(() => {
      //   const el = msgContainerRef.current;
      //   if (el) {
      //     el.scrollTop = el.scrollHeight;
      //   }
      //   initialLoadDone.current = true; // 🔥 IMPORTANT
      // });
    } catch (error) {
      console.log("error in fetching :",error);
      
    }
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
  }, []);

  useEffect(() => {
    console.log("presense :",presence);
    setScrollRoot(msgContainerRef.current);
  }, [isClient, messages.length]);

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

  const handlesendMessage = async () => {
    if (input.trim() === "" && pendingFiles.length === 0) return;

    const hasFiles = pendingFiles.length > 0;
    const msg: MessageData = {
      id: uuidv4(),
      sender: currentMobile,
      receiver: mobile,
      text: input.trim() === "" ? null : input.trim(),
      hasText: input.trim() !== "",
      hasFiles,
      files: hasFiles
        ? pendingFiles.map(({ fileName, fileType, fileId,objectName }) => ({
            fileName,
            fileType,
            fileId,
            objectName,
            uploadProgress: 0,
          }))
        : undefined,
      timestamp: Date.now(),
      roomId: currentRoomId,
      isRead: false,
      isSent: false,
      isUploading: hasFiles,
      delivered: false,
    };

    const filesToUpload = [...pendingFiles];
    setInput("");
    setPendingFiles([]);

    await sendMessage(msg, filesToUpload);
  };

  const sendMessage = async (
    msg: MessageData,
    filesToUpload: typeof pendingFiles = [],
  ) => {
    if (!currentMobile) return; 
    const socket = getSocket(currentMobile);

    await handleNewMessage(msg.roomId, msg);

    const socketPayload: MessageData = {
      ...msg,
      files: msg.files?.map(({ fileName, fileType, fileId,objectName }) => ({
        fileName,
        fileType,
        fileId,
        objectName,
      })),
    };

    socket.emit("send_message",{
      ...socketPayload,
      timestamp:new Date(msg.timestamp).getTime()
    });

    if (!msg.hasFiles || !filesToUpload.length) return;

    try {
      const uploadedFiles: Array<{
        fileId: string;
        fileName: string;
        fileType: string;
        objectName:string;
        objectKey: string;
      }> = [];

      for (const file of filesToUpload) {
        if (!file.fileData) continue;
        const res = await getPresignedUrl({
          objectName:file.objectName,
          expires:60
        })
        if(!res){
          alert(res)
        }
        console.log("ttttttt :",res);

        const result = await uploadMediaFile(
          res.data,
          file.fileData,
          file.fileId,
          msg.id,
          msg.roomId,
          file.objectKey,
          (progress) => {
            handleUpdateFileProgress(msg.roomId, msg.id, file.fileId, progress);
          },
        );

        uploadedFiles.push({
          fileId: file.fileId,
          fileName: file.fileName,
          fileType: file.fileType,
          objectName:file.objectName,
          objectKey: result.objectKey,
        });

        handleUpdateFileProgress(
          msg.roomId,
          msg.id,
          file.fileId,
          100,
          result.objectKey,
        );
      }

      await completeMessageUpload({
        messageId: msg.id,
        roomId: msg.roomId,
        sender: msg.sender,
        receiver: msg.receiver,
        text: msg.text,
        hasText: msg.hasText,
        timestamp: msg.timestamp,
        files: uploadedFiles,
      });

      handleUpdateMessage(msg.roomId, msg.id, {
        isUploading: false,
        files: uploadedFiles.map((file) => ({
          ...file,
          uploadProgress: 100,
        })),
      });
    } catch {
      toast.error("Failed to upload media");
      handleUpdateMessage(msg.roomId, msg.id, { isUploading: false });
    }
  };

  const handleBackToChatList = () => {
    router.back(); // replace with your actual route
  };

  if (!isClient) return null;
  console.log("pendingFiles :",pendingFiles);
  
  console.log("meeee : ",messages);
  
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
                  {presence?.online && presence.online === true
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
            {messages.map((msg,i) => (
              <ChatMessageBubble
                key={i}
                message={msg}
                currentMobile={currentMobile}
                roomId={roomId}
                scrollRoot={scrollRoot}
              >
                {msg.text && (
                  <MessageTextContent
                    text={msg.text}
                    message={msg}
                    currentMobile={currentMobile}
                  />
                )}
                {msg.hasFiles &&
                  msg.files?.map((file) => (
                    <MediaPreviewLoader
                      key={file.fileId}
                      file={file}
                      isOwnMessage={msg.sender === currentMobile}
                      isUploading={msg.isUploading}
                    />
                  ))}
              </ChatMessageBubble>
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
