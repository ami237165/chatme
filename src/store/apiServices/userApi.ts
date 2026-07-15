import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    list: builder.query<any, string>({
      query: (userId) => ({
        url: "connections/list",
        method: "POST",
        body: { userId },
      }),
      providesTags: ["Connections"],
    }),

    findOne: builder.query<any, string>({
      query: (mobileNumber) => ({
        url: "users/fineOne",
        method: "POST",
        body: { mobileNumber },
      }),
    }),

    search: builder.query<any, string>({
      query: (query) => ({
        url: "users/findAll",
        method: "POST",
        body: { query },
      }),
    }),
  }),
});

export const { useListQuery, useSearchQuery } = userApi;
