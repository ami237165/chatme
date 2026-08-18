import { useSelector } from "react-redux";
import { RootState } from "@/store";

type PersistedMessageState = RootState["message"] & {
  _persist?: {
    rehydrated?: boolean;
  };
};

export const useMessagesRehydrated = () =>
  useSelector(
    (state: RootState) =>
      (state.message as PersistedMessageState)._persist?.rehydrated ?? false,
  );
