import { useListQuery } from "@/store/apiServices/userApi";

export const useGetContactList = (currentMobile,isAuthChecked) =>{
  console.log("called ");
  
        const { data, error, isLoading } = useListQuery(currentMobile, {
            skip: !isAuthChecked,
          });
                console.log("here is the response data ,",data);

    return {data, error, isLoading};
}