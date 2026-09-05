import { baseApi } from "./baseApi";

export const loadmsg = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadMessages: builder.mutation<any, {roomId:string, from: string; to: string; }>({
      query: ({roomId, from, to }) => ({
        url: "msgs/getMsgInRange",
        method: "POST",
        body: {roomId, from, to },
      }),
      invalidatesTags: ["Messages"],
    }),
    conversation:builder.mutation({
        query:(data) =>({
          url:"msgs/handleFirstMsg",
          method:'POST',
          body:data,
        }),
      })
  }),
});

export const { useLoadMessagesMutation,useConversationMutation } = loadmsg;
