"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { isTokenValid } from "@/utils/token_decoder";
import { closeSocket } from "@/utils/SocketIo/SocketIo";
import { clearAuth } from "@/store/slices/slice";
import SocketEventsProvider from "@/components/SocketEventsProvider";
import GlobalCallOverlay from "@/components/GlobalCallOverlay";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.access_token);

  useEffect(() => {
    setIsClient(true);
    if (!isTokenValid(token)) {
      void (async () => {
        await closeSocket();
        dispatch(clearAuth());
        router.replace("/login");
      })();
    }
  }, [token, dispatch, router]);

  if (!isClient || !isTokenValid(token)) return null;

  return (
    <>
      <SocketEventsProvider />
      <GlobalCallOverlay />
      {children}
    </>
  );
};

export default ProtectedRoutes;
