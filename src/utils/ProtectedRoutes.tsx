"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { tryDecodeJWT } from "@/utils/token_decoder";
import SocketEventsProvider from "@/components/SocketEventsProvider";
import GlobalCallOverlay from "@/components/GlobalCallOverlay";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const token = useSelector((state: any) => state.auth.access_token);

  useEffect(() => {
    setIsClient(true);
    if (!token) {
      router.replace("/login");
    } else {
      const decoded = tryDecodeJWT(token);
      if (!decoded || decoded.payload?.exp * 1000 < Date.now()) {
        localStorage.removeItem("access_token");
        router.replace("/login");
      }
    }
  }, [token]);

  if (!isClient || !token) return null;

  return (
    <>
      <SocketEventsProvider />
      <GlobalCallOverlay />
      {children}
    </>
  );
};

export default ProtectedRoutes;
