"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { isTokenValid } from "@/utils/token_decoder";
import { closeSocket } from "@/utils/SocketIo/SocketIo";
import { clearAuth } from "@/store/slices/slice";
import SocketEventsProvider from "@/components/SocketEventsProvider";
import GlobalCallOverlay from "@/components/GlobalCallOverlay";
import { useTokenExpiry } from "@/hooks/useTokenExpiry";
import { logoutUser } from "@/utils/logout";
import { subscribeAuthChannel } from "@/utils/authChannel";
import { isLoggingOut, refreshAccessToken } from "@/utils/sessionAuth";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.access_token);

  const handleSessionExpired = useCallback(() => {
    if (isLoggingOut()) return;
    void logoutUser({ broadcast: true });
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    setIsClient(true);

    const verifyAuth = async () => {
      if (isLoggingOut()) {
        setIsCheckingAuth(false);
        return;
      }

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      if (isTokenValid(token)) {
        setIsCheckingAuth(false);
        return;
      }

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        setIsCheckingAuth(false);
        return;
      }

      if (isLoggingOut()) {
        setIsCheckingAuth(false);
        return;
      }

      await closeSocket("tab-close");
      dispatch(clearAuth());
      router.replace("/login");
      setIsCheckingAuth(false);
    };

    void verifyAuth();
  }, [token, dispatch, router]);

  useTokenExpiry(handleSessionExpired);

  useEffect(() => {
    return subscribeAuthChannel(() => {
      void logoutUser({ broadcast: false }).then(() => {
        router.replace("/login");
      });
    });
  }, [router]);

  if (!isClient || isCheckingAuth || !isTokenValid(token)) return null;

  return (
    <>
      <SocketEventsProvider />
      <GlobalCallOverlay />
      {children}
    </>
  );
};

export default ProtectedRoutes;
