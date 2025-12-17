import { motion } from "framer-motion";

export const ButtonLoader = () => {
  return (
    <motion.div
      className="relative w-5 h-5"
      initial={{ scale: 0.9 }}
      animate={{ scale: [0.9, 1.05, 0.9] }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Outer spinner */}
      <motion.div
        className="absolute inset-0 border-2 border-blue-200 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
      />

      {/* Inner glow pulse */}
      <motion.div
        className="absolute inset-[4px] rounded-full bg-blue-400/40"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};
