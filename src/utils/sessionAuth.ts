import { ApiResponse } from "@/interfaces/response.InterFace";
import { store } from "@/store";
import {
  setCurrentMobile,
  setCurrentUser,
  setToken,
} from "@/store/slices/slice";
import { decodeJWT } from "@/utils/token_decoder";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

let loggingOut = false;
let refreshPromise: Promise<ApiResponse | null> | null = null;

export const isLoggingOut = () => loggingOut;

export const setLoggingOut = (value: boolean) => {
  loggingOut = value;
};

const performRefresh = async (): Promise<ApiResponse | null> => {
  try {
    const res = await fetch(`${API_BASE}auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    const data: ApiResponse = await res.json();
    if (data.statusCode !== 200 || !data.data?.access_token) {
      return null;
    }

    store.dispatch(setToken(data.data.access_token));
    const decoded = decodeJWT(data.data.access_token);
    store.dispatch(setCurrentMobile(decoded?.payload?.mobileNumber || null));
    store.dispatch(setCurrentUser(JSON.stringify(decoded?.payload) || null));

    return data;
  } catch {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<ApiResponse | null> => {
  if (loggingOut) return null;

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const logoutSession = async (): Promise<void> => {
  try {
    await fetch(`${API_BASE}auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    // Network failure should not block local logout cleanup.
  }
};
