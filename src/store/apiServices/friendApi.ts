import { baseApi } from "./baseApi";

export const friendApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addFriend: builder.mutation({
      query: (data) => ({
        url: "users/addFriend",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Contacts"],
    }),
  }),
});

export const { useAddFriendMutation } = friendApi;
