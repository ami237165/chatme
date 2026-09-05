import { createSlice } from "@reduxjs/toolkit";

export const callSlice = createSlice({
  name: "call",
  initialState: { status: "idle" },
  reducers: {
    initiateCall(state) { state.status = "calling"; },
    incomingCall(state) { state.status = "incoming"; },
    acceptCall(state) { state.status = "connected"; },
    declineCall(state) { state.status = "idle"; },
    endCall(state) { state.status = "idle"; },
  }
});

export const videoSlice = createSlice({
  name: "video",
  initialState: { localStream: null, remoteStream: null },
  reducers: {
    setLocalStream(state, action) { state.localStream = action.payload; },
    setRemoteStream(state, action) { state.remoteStream = action.payload; },
    clearStreams(state) { state.localStream = null; state.remoteStream = null; }
  }
});

export const peerSlice = createSlice({
  name: "peer",
  initialState: { offer: null, answer: null },
  reducers: {
    setOffer(state, action) { state.offer = action.payload; },
    setAnswer(state, action) { state.answer = action.payload; },
    clearPeer(state) {
      state.offer = null;
      state.answer = null;
    },
  }
});

export const callActions = callSlice.actions;
export const videoActions = videoSlice.actions;
export const peerActions = peerSlice.actions;
