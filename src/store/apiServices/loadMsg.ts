import { baseApi } from "./baseApi";

export const loadmsg = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadMessages: builder.mutation<any, {roomId:string, from: number; to: number }>({
      query: ({roomId, from, to }) => ({
        url: "msgs/getMsgInRange",
        method: "POST",
        body: {roomId, from, to },
      }),
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
