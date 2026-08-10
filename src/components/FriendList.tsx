import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useUnreadMessages } from "@/hooks/useUnreadMsg";
import { getRoomId } from "@/utils/getRoomId";

const FriendList = () => {
  const friens = useSelector((state: RootState) => state.friends.friends);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);

  console.log("friens :", friens);
  const router = useRouter();

  const handleClick = (mobileNumber) => {
    router.push(`/chat/${mobileNumber}`);
  };
  const { unreadByRoomId } = useUnreadMessages();

  return (
    <div>
      <div>Friends List</div>
      {friens.length > 0 &&
        friens.map((f, i) => {
          const roomId = getRoomId(currentMobile, f.mobileNumber);
          const roomUnread = unreadByRoomId[roomId];
          const unreadMessages = roomUnread?.messages || [];
          const unreadCount = roomUnread?.count || 0;
          return (
            <div
              key={i}
              onClick={() => handleClick(f.mobileNumber)}
              className="flex flex-row justify-between p-4 bg-gray-500 rounded-md"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shadow-md flex-shrink-0">
                {f.profilePicture ? (
                  <img
                    src={f.profilePicture}
                    alt={f.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-base">
                    {f.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div>
                <div>
                  <h3>{f.name}</h3>
                </div>
                <div>
                  <h2>{f.mobileNumber}</h2>
                </div>
              </div>
              <div>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default FriendList;
