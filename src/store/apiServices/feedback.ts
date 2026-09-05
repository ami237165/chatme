import { baseApi } from "./baseApi";

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveFeedBack: builder.mutation({
      query: (data) => ({
        url: "feedback/save",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useSaveFeedBackMutation } = feedbackApi;
