import { persistor, store } from "@/store";
import { resetStore } from "@/store/resetAction";
import { clearAuth } from "@/store/slices/slice";
import { clearMessages } from "@/store/slices/message.slice";
import { closeSocket } from "@/utils/SocketIo/SocketIo";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import { useSelector } from "react-redux";

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
    console.log("IndexedDB purge failed");
    // Storage can be blocked in incognito or private mode.
  }
};

export const logoutUser = async () => {
  await closeSocket();
  clearBrowserStorage();
  store.dispatch(clearMessages());
  store.dispatch(clearAuth());
  store.dispatch(resetStore());

  try {
    await persistor.purge();
  } catch {
    console.log("hwhwhhw");

    // IndexedDB purge may fail in incognito; auth is already cleared.
  }

  clearIndexedDatabases();
};
