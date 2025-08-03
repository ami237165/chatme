"use client";
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/store/authApi";
import { callSlice, peerSlice, videoSlice } from "@/store/slices/callSlice"; // ✅ Uses new callSlice
import authReducer from "@/store/slices/slice"; // ✅ correct slice
import messagesReducer from "@/store/slices/message.slice";
import { persistReducer, persistStore } from "redux-persist";
import idbStorage from "@/utils/storageAdopter";

const persistConfig = {
  key: "message",
  storage:idbStorage,
};
const persistedReducer = persistReducer(persistConfig, messagesReducer);

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    call: callSlice.reducer,
    video: videoSlice.reducer,
    peer: peerSlice.reducer,
    auth: authReducer, // ✅ correct reducer
    message: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types because they carry MediaStream or RTCPeerConnection
        ignoredActions: [
          "video/setLocalStream",
          "video/setRemoteStream",
          "peer/setRemoteDiscription",
          "peer/setOffer",
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/FLUSH",
          "persist/PURGE",
          "persist/REGISTER",
        ],
        // Ignore paths in state
        ignoredPaths: [
          "video.localStream",
          "video.remoteStream",
          "peer.connection",
          "peer.remoteDiscription",
          "peer.offer",
          "register",
        ],
      },
    }).concat(authApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
