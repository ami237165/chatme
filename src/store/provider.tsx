"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/store/index";
import { useEffect } from "react";
import {
  setCurrentMobile,
  setCurrentUser,
  setToken,
} from "./slices/slice";
import { PersistGate } from "redux-persist/integration/react";
import { AnimatePresence } from "framer-motion";
import { getBrowserSessionId } from "@/utils/browserSession";
import { isTokenValid } from "@/utils/token_decoder";
import { isLoggingOut, refreshAccessToken } from "@/utils/sessionAuth";
import { decodeJWT } from "@/utils/token_decoder";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const bootstrapAuth = async () => {
      if (isLoggingOut()) return;

      const token = localStorage.getItem("access_token");
      getBrowserSessionId();

      if (token && isTokenValid(token)) {
        store.dispatch(setToken(token));
        return;
      }

      if (!token) return;

      const refreshed = await refreshAccessToken();
      if (refreshed?.data?.access_token) {
        const decoded = decodeJWT(refreshed.data.access_token);
        store.dispatch(setCurrentMobile(decoded?.payload?.mobileNumber || null));
        store.dispatch(setCurrentUser(JSON.stringify(decoded?.payload) || null));
      }
    };

    void bootstrapAuth();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </PersistGate>
    </Provider>
  );
}
