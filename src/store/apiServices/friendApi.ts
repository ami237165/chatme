import { baseApi } from "./baseApi";

export const friendApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addFriend: builder.mutation({
      query: (data) => ({
        url: "requests",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Connections"],
    }),
    response:builder.mutation({
      query:(data) =>({
        url:'requests/response',
        method:'POST',
        body:data
      }),    
    })
  }),
});



export const { useAddFriendMutation,useResponseMutation } = friendApi;
