import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  access_token:
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  contacts:
    typeof window !== "undefined" && localStorage.getItem("contacts")
      ? JSON.parse(localStorage.getItem("contacts") || "[]")
      : [],
  currentMobile:
    typeof window !== "undefined" && localStorage.getItem("currentMobile")
      ? localStorage.getItem("currentMobile")
      : null,
  currentUser:
    typeof window !== "undefined" && localStorage.getItem("currentUser")
      ? (localStorage.getItem("currentUser"))
      : {},    
  showCallUI: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.access_token = action.payload;
      localStorage.setItem("access_token", action.payload);
    },
    setContacts: (state, action) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("contacts");
      }
      state.contacts = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("contacts", JSON.stringify(action.payload));
      }
    },
    setCurrentMobile: (state, action) => {
      state.currentMobile = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("currentMobile", action.payload);
      }
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", (action.payload));
      }
    },
    clearAuth: (state) => {
      state.access_token = null;
      state.contacts = [];
      state.currentMobile = null;
      state.currentUser = {};
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("contacts");
        localStorage.removeItem("currentMobile");
        localStorage.removeItem("currentUser");
      }
    },
   
  },
});
export const {
  setToken,
  setContacts,
  setCurrentMobile,
  setCurrentUser,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
