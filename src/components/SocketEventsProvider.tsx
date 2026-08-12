"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket, emitGoOffline } from "@/utils/SocketIo/SocketIo";
import { isTokenValid } from "@/utils/token_decoder";
import { useHandleNewMsg } from "@/hooks/useHandleNewMsg";
import { useUpdateMsg } from "@/hooks/useUpdatedMsg";
import {
  callActions,
  peerActions,
  videoActions,
} from "@/store/slices/callSlice";
import { getPeer } from "@/utils/callRelated/Peer";
import { useDispatch } from "react-redux";

const getRoomId = (userA: string, userB: string) =>
  [userA, userB].sort().join("_");

export default function SocketEventsProvider() {
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const token = useSelector((state: any) => state.auth.access_token);
  const dispatch = useDispatch();
  const { handleNewMessage } = useHandleNewMsg();
  const { handleUpdateMessage, handleUpdateFileProgress } = useUpdateMsg();

  useEffect(() => {
    if (!currentMobile || !isTokenValid(token)) return;

    const socket = getSocket(currentMobile);
    if (!socket.connected) socket.connect();

    const onReceiveMessage = async (payload: { data: any }) => {
      const msg = payload.data;
      if (!msg || msg.receiver !== currentMobile) return;
      const roomId = msg.roomId ?? getRoomId(msg.sender, msg.receiver);
      await handleNewMessage(roomId, msg);

      socket.emit("message_recived", {
        msg_id: msg.id,
        sender: msg.sender,
        roomId,
      });
      handleUpdateMessage(roomId, msg.id, { delivered: true });
    };

    const onMessageSent = async (data: {
      msg_id: string;
      roomId?: string;
      isSent?: boolean;
    }) => {
      if (!data.roomId) return;
      const { msg_id, ...remaining } = data;
      handleUpdateMessage(data.roomId, msg_id, remaining);
    };

    const onMessageDelivered = async (data: {
      msg_id: string;
      roomId?: string;
      delivered?: boolean;
    }) => {
      if (!data.roomId) return;
      const { msg_id, ...remaining } = data;
      console.log("message delivered");

      handleUpdateMessage(data.roomId, msg_id, remaining);
    };

    const onMessageRead = async (data: {
      msg_id: string;
      roomId?: string;
      isRead?: boolean;
    }) => {
      if (!data.roomId) return;
      const { msg_id, ...remaining } = data;
      handleUpdateMessage(data.roomId, msg_id, remaining);
    };

    const onUploadProgress = (data: {
      messageId?: string;
      roomId?: string;
      fileId: string;
      progress: number;
      phase: string;
      objectKey?: string;
    }) => {
      if (!data.roomId || !data.messageId) return;
      console.log("here in ",data.roomId,data.messageId);
      
      handleUpdateFileProgress(
        data.roomId,
        data.messageId,
        data.fileId,
        data.progress,
        data.objectKey,
      );
    };

    const onMessageMediaReady = async (data: {
      msg_id: string;
      roomId?: string;
      isUploading?: boolean;
      files?: Array<{
        fileId: string;
        objectName:string;
        fileName: string;
        fileType: string;
        objectKey: string;
      }>;
    }) => {
      if (!data.roomId) return;
      handleUpdateMessage(data.roomId, data.msg_id, {
        isUploading: false,
        files: data.files,
      });
    };

    const onCallOffer = async (data: {
      sender: string;
      receiver: string;
      offer: RTCSessionDescriptionInit;
      roomId: string;
    }) => {
      if (data.receiver !== currentMobile) return;

      const peer = getPeer(data.sender);

      if (!navigator.mediaDevices?.getUserMedia) return;

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
        },
      });

      dispatch(videoActions.setLocalStream(stream));
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      await peer.setRemoteDescription(new RTCSessionDescription(data.offer));
      dispatch(peerActions.setOffer(data));

      const answer = await peer.createAnswer();
      const answerData = {
        sender: currentMobile,
        receiver: data.sender,
        answer,
        roomId: data.roomId,
      };
      await peer.setLocalDescription(answer);
      dispatch(peerActions.setAnswer(answerData));
      dispatch(callActions.incomingCall());
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("message_sent", onMessageSent);
    socket.on("message_delivered", onMessageDelivered);
    socket.on("call-offer", onCallOffer);
    socket.on("message_red", onMessageRead);
    socket.on("upload_progress", onUploadProgress);
    socket.on("message_media_ready", onMessageMediaReady);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_sent", onMessageSent);
      socket.off("message_delivered", onMessageDelivered);
      socket.off("call-offer", onCallOffer);
      socket.off("message_red", onMessageRead);
      socket.off("upload_progress", onUploadProgress);
      socket.off("message_media_ready", onMessageMediaReady);
    };
  }, [currentMobile, token, dispatch, handleNewMessage, handleUpdateMessage, handleUpdateFileProgress]);

  useEffect(() => {
    const handlePageHide = () => {
      emitGoOffline();
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  return null;
}
