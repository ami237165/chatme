import React from "react";

export const MobileInput = React.memo(({ mobile, setMobile }:{ mobile: any; setMobile: any; }) => {
  console.log("MobileInput rendered");
  return (
   <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            type="text"
            placeholder="Enter Mobile Number"
            className="border-b-2 border-gray-500 focus:border-gray-800 focus:outline-none text-black py-2 placeholder-gray-400 transition"
          />
  );
});
