import { useListQuery } from "@/store/apiServices/userApi";

export const useGetContactList = (currentMobile,isAuthChecked) =>{
    
        const { data, error, isLoading } = useListQuery(currentMobile, {
            skip: !isAuthChecked,
          });
                
    return {data, error, isLoading};
}