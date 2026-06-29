import { authApi } from "@/store/apiServices/authapi";
import { RegisterPayload } from "./interFace";
import { store } from "@/store";

export const service = async (payload: RegisterPayload) => {
  const result = await store
    .dispatch(authApi.endpoints.register.initiate(payload))
    .unwrap();
        
  return result;
};
