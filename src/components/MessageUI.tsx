"use client";
import { motion, AnimatePresence } from "framer-motion";

interface MessageUIProps {
  errorMessage?: string;
  successMessage?: string;
}

export const MessageUI: React.FC<MessageUIProps> = ({
  errorMessage,
  successMessage,
}) => {
  return (
    <AnimatePresence mode="wait">
      {errorMessage && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-4 text-red-700 dark:text-red-300 text-sm 
                     bg-red-100 dark:bg-red-800/40 
                     px-4 py-2 rounded shadow-sm border border-red-300 dark:border-red-700"
        >
          {errorMessage}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-4 text-green-700 dark:text-green-300 text-sm 
                     bg-green-100 dark:bg-green-800/40 
                     px-4 py-2 rounded shadow-sm border border-green-300 dark:border-green-700"
        >
          {successMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
