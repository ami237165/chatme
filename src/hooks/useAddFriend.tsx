import { AddFriend } from "@/interfaces/addFriend"
import { ApiResponse } from "@/interfaces/response.InterFace"
import { useAddFriendMutation } from "@/store/apiServices/friendApi"

export const useAddFriend = () =>{
    const [addfriend] = useAddFriendMutation()
    const addUser = async (data:AddFriend):Promise<ApiResponse> =>{
        return await addfriend(data).unwrap()

    }
    return {addUser}
}