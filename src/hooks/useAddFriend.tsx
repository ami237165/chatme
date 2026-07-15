import { AddFriend } from "@/interfaces/addFriend"
import { ApiResponse } from "@/interfaces/response.InterFace"
import { useAddFriendMutation, useResponseMutation } from "@/store/apiServices/friendApi"

export const useAddFriend = () =>{
    const [addfriend] = useAddFriendMutation()
    const addUser = async (data:AddFriend):Promise<ApiResponse> =>{
        return await addfriend(data).unwrap()

    }
    return {addUser}
}

export const useResponse = () =>{
    const [response] = useResponseMutation();
    const respToReq = async (data):Promise<ApiResponse> =>{
        return await response(data).unwrap()
    }
    return {respToReq}
}