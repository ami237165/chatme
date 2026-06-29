"use client";
import { useFormData } from "@/hooks/useFormData";
import { useRef } from "react";
import { service } from "./service";
import { useAsyncForm } from "@/hooks/useAsyncForm";
import { ApiResponse } from "@/interfaces/response.InterFace";
import { MessageUI } from "@/components/MessageUI";

export default function SignupPage() {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  // inside a component or custom hook
  const { formData, handleChange } = useFormData({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
  });

  const { setErrorMessage,setSuccessMessage,isSubmitting,redirect,errorMessage,successMessage,run} = useAsyncForm();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let data: ApiResponse = await run(() => service(formData));
       if(data?.statusCode){
    if(data.statusCode === 200){
      setSuccessMessage(data.message);
      redirect('/login')
    }else{
      setErrorMessage(data.message);
    }
   } 
    
    // run(() => service(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Sign Up
        </h2>
        <MessageUI errorMessage={errorMessage} successMessage={successMessage}/>
        <form onSubmit={handleSubmit} className="space-y-5">
          {["name", "mobileNumber", "email", "password"].map((field, index) => (
            <div key={field}>
              <label
                className="block text-sm text-gray-300 mb-1"
                htmlFor="name"
              >
                {field === "mobileNumber"
                  ? "Mobile Number"
                  : field[0].toUpperCase() + field.slice(1)}
              </label>
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                name={field}
                type={
                  field === "password"
                    ? "password"
                    : field === "email"
                    ? "email"
                    : "text"
                }
                value={(formData as any)[field]}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (index < inputRefs.current.length - 1) {
                      inputRefs.current[index + 1]?.focus();
                    } else {
                      handleSubmit(e); // submit on last input
                    }
                  }
                }}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
                placeholder={
                  field === "mobileNumber"
                    ? "Your mobile number"
                    : `Enter your ${field}`
                }
                required
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 mt-2 bg-white text-black rounded hover:bg-gray-300 transition disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-gray-400 text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-white underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
