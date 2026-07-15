import { baseApi } from "./baseApi";

export const requestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRequests: builder.mutation({
      query: (data) => ({
        url: "requests/list",
        method: "Post",
        body: data
      }),
      invalidatesTags: ["Requests"],
    }),
  }),
});

export const { useGetRequestsMutation } = requestApi;