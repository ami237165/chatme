"use client";

import { Provider } from "react-redux";
import { persistor, store } from "@/store/index";
import { useEffect } from "react";
import { setToken } from "./slices/slice";
import { PersistGate } from "redux-persist/integration/react";
import { AnimatePresence } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      store.dispatch(setToken(token));
    }
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </PersistGate>
    </Provider>
  );
}
