"use client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/index";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.access_token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (!token) {
        console.log("expireeee");
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: "registeration/new",
        method: "POST",
        body: credentials,
      }),
    }),
    list: builder.query<any, void>({
      query: () => ({
        url: "users/findAll",
        method: "POST",
      }),
    }),
  }),
});
export const { useLoginMutation, useListQuery,useRegisterMutation } = authApi;
