import { useSaveFeedBackMutation } from "@/store/apiServices/feedback";

export const useFeedBackService = () => {
  const [saveFeedBack] = useSaveFeedBackMutation();

  const save = async (body) => {
    return await saveFeedBack(body).unwrap();
  };

  return { save };
};