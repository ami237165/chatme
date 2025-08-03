"use client";
import React, { useEffect, useState } from "react";
import { useListQuery } from "@/store/authApi";
import { useRouter } from "next/navigation";
import ProtectedRoutes from "@/utils/ProtectedRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setContacts } from "@/store/slices/slice";
import { getSocket } from "@/utils/SocketIo/SocketIo";
import AnimatedPageWrapper from "@/components/AnimatedPageWrapper";
import { Dialog } from "@headlessui/react";
import { Plus } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.access_token);
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteNumber, setInviteNumber] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthChecked(true);
    const socket = getSocket(currentMobile);
    if (!socket.connected) socket.connect();
  }, [token, router]);

  const { data, error, isLoading } = useListQuery(undefined, {
    skip: !isAuthChecked,
  });

  useEffect(() => {
    if (data) {
      dispatch(setContacts(data));
    }
  }, [data, dispatch]);

  const handleClick = (mobile: string) => {
    router.push(`/chat/${mobile}`);
  };

  const handleInviteSubmit = () => {
    console.log("Inviting:", inviteNumber);
    setInviteOpen(false);
    setInviteNumber("");
    // Add invite logic here
  };

  const filteredUsers = data?.filter(
    (user: any) => user?.mobileNumber !== currentMobile
  );

  if (!isAuthChecked) return null;
  if (isLoading) return <div className="text-center py-6 text-white">Loading...</div>;
  if (error) return <div className="text-center py-6 text-red-400">Error fetching list</div>;

  return (
    <AnimatedPageWrapper>
      <ProtectedRoutes>
        <div className="max-w-md mx-auto min-h-screen bg-gray-900 text-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-gray-800 text-white shadow-md rounded-b-xl">
            <h1 className="text-xl font-semibold">Chats</h1>
            <div
              className="w-9 h-9 bg-gray-700 rounded-full cursor-pointer flex items-center justify-center shadow-md hover:bg-gray-600 transition"
              onClick={() => router.push("/profile")}
              title="My Profile"
            >
              <span className="font-bold">P</span>
            </div>
          </div>

          {/* Chat List or Empty State */}
          <div className="p-4">
            {filteredUsers?.length ? (
              <ul className="space-y-4">
                {filteredUsers.map((user: any) => (
                  <li
                    key={user.id}
                    onClick={() => handleClick(user.mobileNumber)}
                    className="flex items-center p-3 bg-gray-800 rounded-xl shadow hover:bg-gray-700 cursor-pointer transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-4">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.mobileNumber.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {user.name ? user.name : user.mobileNumber}
                      </p>
                      <p className="text-sm text-gray-400">Tap to chat</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center mt-20 space-y-4">
                <p className="text-gray-300 text-lg">No one to chat with</p>
                <button
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 text-white rounded-full hover:bg-gray-700 transition"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Someone
                </button>
              </div>
            )}
          </div>

          {/* Invite Dialog */}
          <Dialog
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 bg-black/60"
          >
            <Dialog.Panel className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl space-y-4 text-white">
              <Dialog.Title className="text-lg font-semibold">
                Invite Someone
              </Dialog.Title>
              <input
                type="text"
                placeholder="Enter mobile number"
                value={inviteNumber}
                onChange={(e) => setInviteNumber(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setInviteOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteSubmit}
                  className="px-4 py-2 bg-white text-gray-900 font-medium rounded-md hover:bg-gray-200"
                >
                  Invite
                </button>
              </div>
            </Dialog.Panel>
          </Dialog>
        </div>
      </ProtectedRoutes>
    </AnimatedPageWrapper>
  );
};

export default Page;
