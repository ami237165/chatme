"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  setCurrentMobile,
  setCurrentUser,
  setToken,
} from "@/store/slices/slice";
import { useRouter } from "next/navigation";
import { decodeJWT } from "@/utils/token_decoder";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import { ArrowRight } from "lucide-react";
import { useFormData } from "@/hooks/useFormData";
import { useAsyncForm } from "@/hooks/useAsyncForm";
import { useLoginService } from "./service";
import { ApiResponse } from "@/interfaces/response.InterFace";
import { MessageUI } from "@/components/MessageUI";
import { ButtonLoader } from "@/utils/ButtonLoader";

export default function Login() {
  const { loginUser } = useLoginService();
  const dispatch = useDispatch();
  const router = useRouter();
  const { formData, handleChange } = useFormData({
    mobileNumber: "",
    password: "",
  });
  const {
    setErrorMessage,
    setSuccessMessage,
    isSubmitting,
    redirect,
    errorMessage,
    successMessage,
    run,
  } = useAsyncForm();

  const handleLogin = async () => {
    console.log("handleLogin called");
    
    let data: ApiResponse = await run(() => loginUser(formData));
    console.log(data, "data in login page");
    
    if (data.statusCode === 200) {
      console.log("goes ion");
      dispatch(setToken(data.data.access_token));
      const decoded = decodeJWT(data.data.access_token);
      dispatch(setCurrentMobile(decoded?.payload?.mobileNumber || null));
      console.log("decoded?.payload ,",(decoded?.payload));
      
      dispatch(setCurrentUser(JSON.stringify(decoded?.payload) || null));

      setSuccessMessage(data.message);
      redirect("/list");
    } else {
      setErrorMessage(data.message);
    }
  };
  return (
    <AnimatedPageWrapper>
      <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md bg-white text-black p-8 rounded-2xl shadow-xl space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Login
          </h1>

          <div className="space-y-4">
            <input
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              type="text"
              placeholder="Mobile Number"
              className="w-full border-b-2 border-gray-400 focus:border-gray-900 bg-transparent py-2 px-1 placeholder-gray-500 focus:outline-none transition"
            />
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
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
              disabled={isSubmitting}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 rounded-full hover:bg-gray-800 transition"
          >
            {isSubmitting ? (
              <ButtonLoader />
            ) : (
              <>
                Continue <ArrowRight size={18} />
              </>
            )}
          </button>
          <MessageUI
            errorMessage={errorMessage}
            successMessage={successMessage}
          />
        </div>
      </main>
    </AnimatedPageWrapper>
  );
}
