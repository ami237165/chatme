import { teardownCall } from "@/utils/callRelated/teardownCall";

export const useOnHangUpCall = () => {
  const handleHangUpCall = () => {
    teardownCall();
  };

  return { handleHangUpCall };
};
