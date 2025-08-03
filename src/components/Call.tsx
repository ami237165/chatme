import CallOverLay from "@/utils/callRelated/CallOverLay";
import IncomingCallOverlay from "@/utils/callRelated/inComingCall";
import { getPeer, resetPeer } from "@/utils/callRelated/Peer";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Call = (props: any) => {
  const dispatch = useDispatch();
  // const [calleLocalVideo,setcalleLocalVideo] = useState(null)
  const call = useSelector((state: any) => state.call);
  const offerAanswer = useSelector((state: any) => state.peer);

  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  console.log("offerAanswer ,",offerAanswer);
  

  if (call.status === "calling") {
    return <CallOverLay mobile={props.mobile} />;
  }
  if (call.status === "incoming") {
    return <IncomingCallOverlay mobile={props.mobile} />;
  }
  if (call.status === "connected") {
    return <CallOverLay mobile={props.mobile} />;
  }
  return null;
};

export default Call;
