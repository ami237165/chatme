import { createSlice } from "@reduxjs/toolkit";
console.log("hitting slice");

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
      : [],
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
   
  },
});
export const {
  setToken,
  setContacts,
  setCurrentMobile,
} = authSlice.actions;

export default authSlice.reducer;
