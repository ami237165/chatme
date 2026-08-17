import { baseApi } from "./baseApi";

export const loadmsg = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadMessages: builder.mutation<any, {roomId:string, from: number; to: number; start: number; stop: number }>({
      query: ({roomId, from, to,start,stop }) => ({
        url: "msgs/getMsgInRange",
        method: "POST",
        body: {roomId, from, to,start,stop },
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
