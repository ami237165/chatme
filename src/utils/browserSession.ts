const BROWSER_SESSION_KEY = "browserSessionId";

export const getBrowserSessionId = (): string => {
  if (typeof window === "undefined") return "";

  const existing = localStorage.getItem(BROWSER_SESSION_KEY);
  if (existing) return existing;

  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(BROWSER_SESSION_KEY, id);
  return id;
};

export const clearBrowserSessionId = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BROWSER_SESSION_KEY);
};
