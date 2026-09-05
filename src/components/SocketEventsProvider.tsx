"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getSocket, closeSocket } from "@/utils/SocketIo/SocketIo";
import { isTokenValid } from "@/utils/token_decoder";
import { useHandleNewMsg } from "@/hooks/useHandleNewMsg";
import { useUpdateMsg } from "@/hooks/useUpdatedMsg";
import {
  callActions,
  peerActions,
} from "@/store/slices/callSlice";
import {
  addCandidateSafely,
  flushCandidates,
  getPeer,
} from "@/utils/callRelated/Peer";
import { teardownCall } from "@/utils/callRelated/teardownCall";
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
        objectName: string;
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

    const onCallOffer = (data: {
      sender: string;
      receiver: string;
      offer: RTCSessionDescriptionInit;
      roomId: string;
    }) => {
      if (data.receiver !== currentMobile || data.sender === currentMobile) {
        return;
      }

      getPeer(data.sender);
      dispatch(peerActions.setOffer(data));
      dispatch(callActions.incomingCall());
    };

    const onCallAnswer = async (data: {
      sender: string;
      receiver: string;
      answer: RTCSessionDescriptionInit;
      roomId: string;
    }) => {
      if (data.receiver !== currentMobile) return;

      const peer = getPeer(data.sender);
      dispatch(peerActions.setAnswer(data));

      if (peer.signalingState !== "have-local-offer") return;

      await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
      await flushCandidates();
      dispatch(callActions.acceptCall());
    };

    const onIceCandidate = async (data: {
      receiver: string;
      candidate: RTCIceCandidateInit;
    }) => {
      if (data.receiver !== currentMobile) return;
      await addCandidateSafely(data.candidate);
    };

    const onEndCall = (data: { receiver: string }) => {
      if (data.receiver !== currentMobile) return;
      teardownCall();
    };

    const onHangupCall = (data: { receiver: string }) => {
      if (data.receiver !== currentMobile) return;
      teardownCall();
    };

    socket.on("receive_message", onReceiveMessage);
    socket.on("message_sent", onMessageSent);
    socket.on("message_delivered", onMessageDelivered);
    socket.on("call-offer", onCallOffer);
    socket.on("call-answer", onCallAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("end-call", onEndCall);
    socket.on("hangup-call", onHangupCall);
    socket.on("message_red", onMessageRead);
    socket.on("upload_progress", onUploadProgress);
    socket.on("message_media_ready", onMessageMediaReady);

    return () => {
      socket.off("receive_message", onReceiveMessage);
      socket.off("message_sent", onMessageSent);
      socket.off("message_delivered", onMessageDelivered);
      socket.off("call-offer", onCallOffer);
      socket.off("call-answer", onCallAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("end-call", onEndCall);
      socket.off("hangup-call", onHangupCall);
      socket.off("message_red", onMessageRead);
      socket.off("upload_progress", onUploadProgress);
      socket.off("message_media_ready", onMessageMediaReady);
    };
  }, [currentMobile, token, dispatch, handleNewMessage, handleUpdateMessage, handleUpdateFileProgress]);

  useEffect(() => {
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      teardownCall();
      void closeSocket("tab-close");
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  return null;
}
