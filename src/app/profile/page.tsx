"use client";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import ProtectedRoutes from "@/utils/ProtectedRoutes";
import { decodeJWT } from "@/utils/token_decoder";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const router = useRouter();
  const token = useSelector((state: any) => state.auth.access_token);
  const [details, setdetails] = useState<any>();
  useEffect(() => {
    let val = decodeJWT(token);
    setdetails(val.payload);
    console.log("val ,", val.payload);
  }, [token]);

  const handleLogout = () => {
    // ✅ Clear tokens, Redux state, IndexedDB if needed
    localStorage.clear(); // or specific keys
    indexedDB.deleteDatabase("ChatMediaDB"); // optional
    indexedDB.deleteDatabase("localforage"); // optional

    router.push("/login"); // or your auth screen
  };

  return (
    <AnimatedPageWrapper>
      <ProtectedRoutes>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <h2 className="text-l font-semibold text-gray-800">
                {details?.name}
              </h2>
              <p className="text-sm text-gray-500">{details?.mobileNumber}</p>
              <p className="text-sm text-gray-500">your.email@example.com</p>
            </div>

            <div className="mt-8 space-y-4">
              <button
                onClick={() => router.back()}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoutes>
    </AnimatedPageWrapper>
  );
}
