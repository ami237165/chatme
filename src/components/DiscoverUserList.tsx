import { useAddFriend } from "@/hooks/useAddFriend";
import { useGetContactList } from "@/hooks/useGetContactList";
import { AddFriend } from "@/interfaces/addFriend";
import { setContacts } from "@/store/slices/slice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const DiscoverUserList = ({
  id,
  name,
  mobile,
  isAuthChecked,
}: {
  id: number;
  name: string;
  mobile: string;
  isAuthChecked: boolean;
}) => {
 
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.auth.currentUser);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const contacts = useSelector((state: any) => state.auth.contacts);


  const { addUser } = useAddFriend();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const { data, error, isLoading } = useGetContactList(
    currentMobile,
    isAuthChecked
  );

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        textRef.current.style.setProperty(
          "--marquee-distance",
          `${textWidth - containerWidth}px`
        );
        setIsOverflow(true);
      } else {
        setIsOverflow(false);
      }
    }
    console.log("contact list api in add , ", data.data);
  }, [data, name]);

  const handleMessage = (mobile: string) => {
    router.push(`/chat/${mobile}`);
  };
  const handleAdd = async () => {
    const inputData: AddFriend = {
      currentMobile: currentMobile,
      mobileNumber: mobile,
      currentUserId: JSON.parse(currentUser).id,
    };
    console.log("handleAdd ,", inputData);
    await addUser(inputData);
    dispatch(setContacts(data?.data));
  };
  return (
    <li className="p-2 mt-1 w-[95%] flex justify-center items-center bg-gray-200 hover:bg-gray-100 transition-colors rounded-lg shadow-sm">
      {/* Avatar + Name + Mobile */}
      <div className="flex items-center justify-evenly gap-3 w-[100%] overflow-hidden">
        {/* Avatar */}
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
            name
          )}&background=random&color=fff&size=64`}
          alt={name}
          className="w-12 h-12 rounded-full shadow-sm border"
        />

        {/* Name + Mobile */}
        <div ref={containerRef} className="flex flex-col overflow-hidden">
          <span
            ref={textRef}
            className={`text-sm font-semibold text-gray-800 whitespace-nowrap ${
              isOverflow ? "animate-marquee" : "truncate"
            }`}
          >
            {name}
          </span>
          <div className="flex flex-row gap-2 items-center justify-between">
            <p className="text-xs text-gray-500">{mobile}</p>
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleMessage(mobile)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Message
              </button>
              <button
                onClick={() => handleAdd()}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg shadow-md hover:bg-green-700 transition"
              >
                {contacts.some(i=>i.id === id) ? "Added" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
export default DiscoverUserList;
