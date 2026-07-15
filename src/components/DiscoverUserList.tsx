import { useAddFriend } from "@/hooks/useAddFriend";
import { useGetContactList } from "@/hooks/useGetContactList";
import {
  AddFriend,
  ConnectionAction,
  EventStatus,
} from "@/interfaces/addFriend";
import { RootState } from "@/store";
import { Request } from "@/store/slices/friends.slice";
import { setContacts } from "@/store/slices/slice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "./Button";

const DiscoverUserList = ({
  id,
  name,
  mobile,
  isAuthChecked,
}: {
  id: string;
  name: string;
  mobile: string;
  isAuthChecked: boolean;
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.auth.currentUser);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const contacts = useSelector((state: any) => state.auth.contacts);
  const requests = useSelector((state: RootState) => state.friends.requests);
  const friens = useSelector((state: RootState) => state.friends.friends);

  const { addUser } = useAddFriend();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const { data, error, isLoading } = useGetContactList(
    currentMobile,
    isAuthChecked,
  );

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;

      if (textWidth > containerWidth) {
        textRef.current.style.setProperty(
          "--marquee-distance",
          `${textWidth - containerWidth}px`,
        );
        setIsOverflow(true);
      } else {
        setIsOverflow(false);
      }
    }
  }, [data, name]);

  const handleMessage = (mobile: string) => {
    router.push(`/chat/${mobile}`);
  };
  const handleAction = async (id: string, action: ConnectionAction) => {
    const inputData: AddFriend = {
      performedBy: JSON.parse(currentUser).id,
      targetUser: id,
      action: ConnectionAction[action],
    };
    await addUser(inputData);
    dispatch(setContacts(data?.data));
  };
  const currentUserId = JSON.parse(currentUser).id;

  const request = requests.find(
    (r) =>
      (r.performedBy.id === currentUserId && r.targetUser.id === id) ||
      (r.performedBy.id === id && r.targetUser.id === currentUserId),
  );

  const renderButtons = () => {
    const friend = friens.find((f) => f.id === id);
    // Already friends
    if (friend && friend.connection_status === "FRIENDS") {
      return (
        <>
          <Button
            className="bg-blue-400 p-2 rounded-sm"
            onClick={() => handleMessage(mobile)}
          >
            Message
          </Button>

          <Button
            className="bg-green-300 p-2 rounded-sm"
            onClick={() => handleAction(id, ConnectionAction.UNFRIEND)}
          >
            Friends ✓
          </Button>
        </>
      );
    }

    // Message only connection
    if (friend && friend.connection_status === "MESSAGE_ALLOWED") {
      return (
        <Button
          className="bg-blue-400 p-2 rounded-sm"
          onClick={() => handleMessage(mobile)}
        >
          Message
        </Button>
      );
    }

    // Blocked
    if (friend && friend.connection_status === "BLOCKED") {
      return (
        <Button disabled className="bg-red-700 p-2 rounded-sm">
          Blocked
        </Button>
      );
    }

    // Existing request logic...

    if (!request) {
      return (
        <>
          <Button
            className="bg-blue-400 p-2 rounded-sm"
            onClick={() => handleMessage(mobile)}
          >
            Message
          </Button>
          <Button
            className="bg-green-400 p-2 rounded-sm"
            onClick={() =>
              handleAction(id, ConnectionAction.SEND_FRIEND_REQUEST)
            }
          >
            Add Friend
          </Button>
        </>
      );
    }

    // I sent request
    if (
      request.action === ConnectionAction.SEND_FRIEND_REQUEST &&
      request.performedBy.id === currentUserId &&
      request.status === EventStatus.PENDING
    ) {
      return (
        <Button
          onClick={() =>
            handleAction(id, ConnectionAction.CANCEL_FRIEND_REQUEST)
          }
          className="bg-red-400 p-2 rounded-sm"
        >
          Cancel Request
        </Button>
      );
    }

    // They sent request
    if (
      request.action === ConnectionAction.SEND_FRIEND_REQUEST &&
      request.targetUser.id === currentUserId &&
      request.status === EventStatus.PENDING
    ) {
      return (
        <>
          <Button
            className="bg-green-600 p-2 rounded-sm"
            onClick={() =>
              handleAction(id, ConnectionAction.ACCEPT_FRIEND_REQUEST)
            }
          >
            Accept
          </Button>

          <Button
            className="bg-red-500 p-2 rounded-sm"
            onClick={() =>
              handleAction(id, ConnectionAction.REJECT_FRIEND_REQUEST)
            }
          >
            Reject
          </Button>
        </>
      );
    }

    if (
      request.action === ConnectionAction.ACCEPT_FRIEND_REQUEST &&
      request.status === EventStatus.DONE
    ) {
      return (
        <>
          <Button
            className="bg-blue-400 p-2 rounded-sm"
            onClick={() => handleMessage(mobile)}
          >
            Message
          </Button>

          <Button
            className="bg-green-300 p-2 rounded-sm"
            onClick={() => handleAction(id, ConnectionAction.UNFRIEND)}
          >
            Friends ✓
          </Button>
        </>
      );
    }

    if (
      request.action === ConnectionAction.BLOCK &&
      request.performedBy.id === currentUserId
    ) {
      return (
        <Button
          className="bg-red-400 p-2 rounded-sm"
          onClick={() => handleAction(id, ConnectionAction.UNBLOCK)}
        >
          Unblock
        </Button>
      );
    }

    if (
      request.action === ConnectionAction.BLOCK &&
      request.targetUser.id === currentUserId
    ) {
      return (
        <Button disabled className="bg-red-700 p-2 rounded-sm">
          Blocked
        </Button>
      );
    }

    return (
      <>
        <Button
          onClick={() => handleMessage(mobile)}
          className="bg-blue-400 p-2 rounded-sm"
        >
          Message
        </Button>
        <Button
          className="bg-green-400 p-2 rounded-sm"
          onClick={() => handleAction(id, ConnectionAction.SEND_FRIEND_REQUEST)}
        >
          Add Friend
        </Button>
      </>
    );
  };
  return (
    // <li className="p-2 mt-1 w-[95%] flex justify-center items-center bg-gray-200 hover:bg-gray-100 transition-colors rounded-lg shadow-sm">
    //   {/* Avatar + Name + Mobile */}
    //   <div className="flex items-center justify-evenly gap-3 w-[100%] overflow-hidden">
    //     {/* Avatar */}
    //     <img
    //       src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
    //         name,
    //       )}&background=random&color=fff&size=64`}
    //       alt={name}
    //       className="w-12 h-12 rounded-full shadow-sm border"
    //     />

    //     {/* Name + Mobile */}
    //     <div ref={containerRef} className="flex flex-col overflow-hidden">
    //       <span
    //         ref={textRef}
    //         className={`text-sm font-semibold text-gray-800 whitespace-nowrap ${
    //           isOverflow ? "animate-marquee" : "truncate"
    //         }`}
    //       >
    //         {name}
    //       </span>
    //       <div className="flex flex-row gap-2 items-center justify-between">
    //         <p className="text-xs text-gray-500">{mobile}</p>
    //         {/* Actions */}
    //         <div className="flex gap-2">
    //           {/* <button
    //             onClick={() => handleMessage(mobile)}
    //             className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg shadow-md hover:bg-blue-700 transition"
    //           >
    //             Message
    //           </button>
    //           <button
    //             onClick={() =>
    //               handleAdd({
    //                 id,
    //                 action: ConnectionAction.SEND_FRIEND_REQUEST,
    //               })
    //             }
    //             className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg shadow-md hover:bg-green-700 transition"
    //           >
    //             {requests &&
    //             requests.some((i: Request) => i.targetUser.id === id)
    //               ? "Requested"
    //               : requests.some((i: Request) => i.performedBy.id === id)
    //                 ? "Accept"
    //                 : "Add"}
    //           </button> */}
    //           {renderButtons()}
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </li>
    <li className="w-full p-3 mt-2 bg-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              name,
            )}&background=random&color=fff&size=64`}
            alt={name}
            className="w-12 h-12 rounded-full border shadow-sm flex-shrink-0"
          />

          {/* User Info */}
          <div
            ref={containerRef}
            className="flex flex-col min-w-0 flex-1 overflow-hidden"
          >
            <span
              ref={textRef}
              className={`font-semibold text-gray-800 whitespace-nowrap ${
                isOverflow ? "animate-marquee" : "truncate"
              }`}
            >
              {name}
            </span>

            <span className="text-sm text-gray-500 truncate">{mobile}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {renderButtons()}
        </div>
      </div>
    </li>
  );
};
export default DiscoverUserList;
