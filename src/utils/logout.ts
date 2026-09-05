import { persistor, store } from "@/store";
import { resetStore } from "@/store/resetAction";
import { clearAuth } from "@/store/slices/slice";
import { clearMessages } from "@/store/slices/message.slice";
import { closeSocket } from "@/utils/SocketIo/SocketIo";
import { clearBrowserSessionId } from "@/utils/browserSession";
import { postLogout } from "@/utils/authChannel";
import { logoutSession, setLoggingOut } from "@/utils/sessionAuth";

const clearBrowserStorage = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("access_token");
  localStorage.removeItem("contacts");
  localStorage.removeItem("currentMobile");
  localStorage.removeItem("currentUser");
  localStorage.clear();
};

const clearIndexedDatabases = () => {
  if (typeof window === "undefined") return;

  try {
    indexedDB.deleteDatabase("ChatMediaDB");
    indexedDB.deleteDatabase("localforage");
  } catch {
    // Storage can be blocked in incognito or private mode.
  }
};

export const logoutUser = async (options?: { broadcast?: boolean }) => {
  const shouldBroadcast = options?.broadcast ?? true;

  setLoggingOut(true);

  try {
    await closeSocket("logout");
    await logoutSession();
    clearBrowserStorage();
    clearBrowserSessionId();
    store.dispatch(clearMessages());
    store.dispatch(clearAuth());
    store.dispatch(resetStore());

    try {
      await persistor.purge();
    } catch {
      // IndexedDB purge may fail in incognito; auth is already cleared.
    }

    clearIndexedDatabases();

    if (shouldBroadcast) {
      postLogout();
    }
  } catch {
    setLoggingOut(false);
  }
};
