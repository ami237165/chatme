import { authApi } from "@/store/authApi";
import { RegisterPayload } from "./interFace";
import { store } from "@/store";

export const service = async (payload: RegisterPayload) => {
  const result = await store
    .dispatch(authApi.endpoints.register.initiate(payload))
    .unwrap();
    console.log("fdfrghjk ,",result);
    
  return result;
};
