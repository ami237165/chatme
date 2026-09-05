"use client";
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/index";
import {
  isLoggingOut,
  refreshAccessToken,
} from "@/utils/sessionAuth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.access_token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const isAuthEndpoint = (args: string | FetchArgs): boolean => {
  const url = typeof args === "string" ? args : args.url;
  return (
    url.includes("auth/refresh") ||
    url.includes("auth/logout") ||
    url.includes("auth/login")
  );
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (isLoggingOut()) {
    return rawBaseQuery(args, api, extraOptions);
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error &&
    result.error.status === 401 &&
    !isAuthEndpoint(args) &&
    !isLoggingOut()
  ) {
    const refreshData = await refreshAccessToken();
    if (refreshData?.data?.access_token) {
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Connections", "Profile", "Messages", "Requests"],
  endpoints: () => ({}),
});
