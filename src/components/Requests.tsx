"use client";
import { useResponse } from "@/hooks/useAddFriend";
import { useGetRequests } from "@/hooks/useGetRequest";
import {
  ConnectionAction,
  EventStatus,
  ResponsToReq,
} from "@/interfaces/addFriend";
import { GetRequests } from "@/interfaces/getRequests";
import { RootState } from "@/store";
import {
  addFriend,
  addRequest,
  removeRequest,
  Request,
} from "@/store/slices/friends.slice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./ui/loader";

const Requests = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.auth.currentUser);
  const requests = useSelector((state: RootState) => state.friends.requests);
  const [loadingId, setLoadingId] = useState<any | null>(null);
  const { respToReq } = useResponse();
  const { fetchRequests } = useGetRequests();
  const fetchData = async () => {
    const data: GetRequests = {
      targetUser: JSON.parse(currentUser).id,
      performedBy: JSON.parse(currentUser).id,
    };
    const result = await fetchRequests(data);
    if (result.statusCode && result.data.length > 0) {
      dispatch(addRequest(result.data));
    }
  };
  useEffect(() => {
    fetchData();
  }, [setLoadingId]);
  const handleResponse = async ({ id, targetUser, action, status }) => {
    setLoadingId(id);
    const data: ResponsToReq = {
      id: id,
      performedBy: JSON.parse(currentUser).id,
      targetUser: targetUser,
      action: action,
      status: status,
    };
    console.log("id", id);
    const res = await respToReq(data);
    if (
      res.statusCode === 200 &&
      res.message === "Request processed successfully"
    ) {
      setLoadingId(null);
      const acceptedRequest = requests.find(
        (r: Request) => r.id === targetUser,
      );
      if (!acceptedRequest) return;
      dispatch(addFriend(acceptedRequest.performedBy));
      dispatch(removeRequest(id));
    }else if(res.statusCode !== 200){
      setLoadingId(null)
    }
  };
  return (
    <div>
      <h1>Requests</h1>
      {requests &&
        requests.map((r: Request) => (
          <div
            key={r.id}
            className="flex justify-between items-center max-w-[100%] bg-gray-500 p-2 rounded-sm shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center shadow-md flex-shrink-0">
                {r.performedBy.profilePicture ? (
                  <img
                    src={r.performedBy.profilePicture}
                    alt={r.performedBy.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-base">
                    {r.performedBy.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2>{r.performedBy.name} Send You A Friend Request</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handleResponse({
                    id: r.id,
                    targetUser: r.performedBy.id,
                    action: ConnectionAction.ACCEPT_FRIEND_REQUEST,
                    status: EventStatus.ACCEPTED,
                  })
                }
                className="bg-green-500 p-2 rounded-sm hover:bg-green-600 text-white"
              >
                {loadingId === r.id ? <Loader /> : "Accept"}
              </button>
              <button className="bg-red-500 p-2 rounded-sm hover:bg-red-600 text-white">
                Decline
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Requests;
