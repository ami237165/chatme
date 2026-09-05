"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getTokenRefreshDelayMs,
  isTokenValid,
} from "@/utils/token_decoder";
import { isLoggingOut, refreshAccessToken } from "@/utils/sessionAuth";

const REFRESH_BUFFER_MS = 60_000;

export const useTokenExpiry = (onExpired: () => void) => {
  const token = useSelector((state: any) => state.auth.access_token);

  useEffect(() => {
    if (!token || isLoggingOut()) return;

    let timeoutId: ReturnType<typeof setTimeout> | any;

    const refreshOrExpire = async () => {
      if (isLoggingOut()) return;

      const refreshed = await refreshAccessToken();
      if (!refreshed && !isLoggingOut()) {
        onExpired();
      }
    };

    const scheduleRefresh = () => {
      const delay = getTokenRefreshDelayMs(token, REFRESH_BUFFER_MS);

      if (delay === null || delay <= 0) {
        void refreshOrExpire();
        return;
      }

      timeoutId = window.setTimeout(() => {
        void refreshOrExpire();
      }, delay);
    };

    scheduleRefresh();

    const onVisible = () => {
      if (document.visibilityState !== "visible" || isLoggingOut()) return;

      window.clearTimeout(timeoutId);

      if (!isTokenValid(token)) {
        void refreshOrExpire();
        return;
      }

      scheduleRefresh();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [token, onExpired]);
};
