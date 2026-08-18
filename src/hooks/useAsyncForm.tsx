// hooks/useAsyncForm.ts
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiResponse } from "@/interfaces/response.InterFace";
import { motion } from "framer-motion";

export function useAsyncForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const run = async (fn: () => Promise<ApiResponse>) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fn();
      
      return res;
    } catch (err: any) {
            
      setErrorMessage(err?.error || "Something went wrong");
      return err;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3500);
    }
  };

  const redirect = (onSuccessRedirect) => {
    if (onSuccessRedirect) {
        router.push(onSuccessRedirect);
    }
  };

  //   const MessageUI = () => (
  //     <>
  //       {errorMessage && (
  //         <motion.div
  //           key="error"
  //           initial={{ opacity: 0, y: -10 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: -10 }}
  //           transition={{ duration: 0.3 }}
  //           className="mb-4 text-red-700 dark:text-red-300 text-sm
  //                    bg-red-100 dark:bg-red-800/40
  //                    px-4 py-2 rounded shadow-sm border border-red-300 dark:border-red-700"
  //         >
  //           {errorMessage}
  //         </motion.div>
  //       )}

  //       {successMessage && (
  //         <motion.div
  //           key="success"
  //           initial={{ opacity: 0, y: -10 }}
  //           animate={{ opacity: 1, y: 0 }}
  //           exit={{ opacity: 0, y: -10 }}
  //           transition={{ duration: 0.3 }}
  //           className="mb-4 text-green-700 dark:text-green-300 text-sm
  //                    bg-green-100 dark:bg-green-800/40
  //                    px-4 py-2 rounded shadow-sm border border-green-300 dark:border-green-700"
  //         >
  //           {successMessage}
  //         </motion.div>
  //       )}
  //     </>
  //   );

  return {
    setErrorMessage,
    setSuccessMessage,
    isSubmitting,
    redirect,
    errorMessage,
    successMessage,
    run,
  };
}
