"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { decodeJWT } from "@/utils/token_decoder";

const ProtectedRoutes = ({ children }: { children: React.ReactNode }) => {
  
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const token = useSelector((state: any) => state.auth.access_token);

  useEffect(() => {
    setIsClient(true);
    if (!token) {
      router.push("/login");
    } else {
      try {
        const decoded: any = decodeJWT(token);
        if (decoded.payload?.exp * 1000 < Date.now()) {
          localStorage.removeItem("access_token");
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      }
    }
  }, [token]);

  if (!isClient || !token) return null;

  return <>{children}</>;
};

export default ProtectedRoutes;
