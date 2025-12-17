// useLoginService.ts
import { ApiResponse } from "@/interfaces/response.InterFace";
import { useLoginMutation } from "@/store/apiServices/authapi";

export function useLoginService() {
  const [login] = useLoginMutation();

  const loginUser = async (formData):Promise<ApiResponse> => {
    return await login(formData).unwrap();
  };
  console.log("useLoginService initialized",loginUser);
  
  return { loginUser };
}
