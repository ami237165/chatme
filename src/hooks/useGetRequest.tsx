import { ApiResponse } from "@/interfaces/response.InterFace"
import { useGetRequestsMutation } from "@/store/apiServices/requestApi"
import { Request } from "@/store/slices/friends.slice"

export const useGetRequests = () =>{
    const [getRequests] = useGetRequestsMutation()
    const fetchRequests = async (data):Promise<Request| any> =>{
        return await getRequests(data).unwrap()
    }

    return { fetchRequests }
}