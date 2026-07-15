import { ConnectionAction, EventStatus } from "@/interfaces/addFriend";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface User{
    id: string;
    mobileNumber: string;
    name: string;
    email: string;
    profilePicture: string | null;
    bio: string | null;
    gender: string | null;
    createdAt: Date;
    updatedAt: Date;
    connectionId?:any;
    connection_status?:any;
    statusChangedAt?:any;
    connection_createdAt?:any;
};
export interface Request {
  id: string;
  performedBy:User;
  targetUser:User;
  action: ConnectionAction;
  status: EventStatus;
  createdAt: string;

}
export interface Friend {
  id: string;
  name: string;
  email: string;
  connection_status: string;
  status: string;
  createdAt:any
}
const friendsSlice = createSlice({
  name: "friends",
  initialState: { requests:[] ,friends:[]},
  reducers: {
    addRequest(state, action: PayloadAction<Request[]>) {
      state.requests = action.payload;
    },
    removeRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter(
        (request) => request.id !== action.payload,
      );
    },
    addFriend(state,action:PayloadAction<User[]>){
      state.friends = action.payload
    },
    removeFriend(state, action: PayloadAction<string | any>) {
      state.friends = state.friends.filter(
        (friend) => friend.id !== action.payload,
      );
    },
  },
});
export const {addRequest,removeFriend,addFriend,removeRequest} = friendsSlice.actions;
export default friendsSlice.reducer;

