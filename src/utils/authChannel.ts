export const AUTH_CHANNEL_NAME = "chatme-auth";

export const postLogout = () => {
  if (typeof window === "undefined") return;

  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.postMessage({ type: "logout" });
    channel.close();
  } catch {
    // BroadcastChannel may be unavailable in some environments.
  }
};

export const subscribeAuthChannel = (onLogout: () => void) => {
  if (typeof window === "undefined") return () => {};

  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === "logout") onLogout();
    };
    return () => channel.close();
  } catch {
    return () => {};
  }
};
