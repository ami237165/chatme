import { useListQuery } from "@/store/apiServices/userApi";

export const useGetContactList = (userId,isAuthChecked) =>{
    
        const { data, error, isLoading } = useListQuery(userId, {
            skip: !isAuthChecked,
          });
                
    return {data, error, isLoading};
}