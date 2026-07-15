"use client";

import { useSelector } from "react-redux";
import Call from "@/components/Call";
import IncomingCallOverlay from "@/utils/callRelated/inComingCall";

export default function GlobalCallOverlay() {
  const call = useSelector((state: any) => state.call);
  const offer = useSelector((state: any) => state.peer?.offer);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);

  if (call.status === "incoming" && offer?.sender) {
    return (
      <IncomingCallOverlay
        mobile={offer.sender}
        currentMobile={currentMobile}
      />
    );
  }

  if (call.status === "calling" || call.status === "connected") {
    if (!offer?.receiver && !offer?.sender) return null;
    const otherMobile =
      offer.sender === currentMobile ? offer.receiver : offer.sender;
    if (!otherMobile) return null;
    return <Call mobile={otherMobile} currentMobile={currentMobile} />;
  }

  return null;
}
