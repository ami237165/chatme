"use client";

import { useState } from "react";
import { useLoginMutation } from "@/store/authApi";
import { useDispatch } from "react-redux";
import { setCurrentMobile, setToken } from "@/store/slices/slice";
import { useRouter } from "next/navigation";
import { decodeJWT } from "@/utils/token_decoder";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const res = await login({ mobileNumber, password }).unwrap();
console.log("ttttttttttt ,",res.access_token);

      if (res.access_token) {
        dispatch(setToken(res.access_token));
        const decoded = decodeJWT(res.access_token);
        dispatch(setCurrentMobile(decoded?.payload?.mobileNumber || null));
        router.push("/list");
      } else {
        setErrorMessage(res.message || "Invalid mobile number or password");
      }
    } catch (error: any) {
      setErrorMessage(error?.error || "Connection Problem");
    }
  };

  return (
    <AnimatedPageWrapper>
      <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md bg-white text-black p-8 rounded-2xl shadow-xl space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">Login</h1>

          <div className="space-y-4">
            <input
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              type="text"
              placeholder="Mobile Number"
              className="w-full border-b-2 border-gray-400 focus:border-gray-900 bg-transparent py-2 px-1 placeholder-gray-500 focus:outline-none transition"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              type="password"
              placeholder="Password"
              className="w-full border-b-2 border-gray-400 focus:border-gray-900 bg-transparent py-2 px-1 placeholder-gray-500 focus:outline-none transition"
            />
          </div>

          <div className="text-sm text-center">
            Don’t have an account?{" "}
            <button
              onClick={() => router.push("/signup")}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
          >
            Continue <ArrowRight size={18} />
          </button>

          {errorMessage && (
            <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded">
              {errorMessage}
            </p>
          )}
        </div>
      </main>
    </AnimatedPageWrapper>
  );
}
