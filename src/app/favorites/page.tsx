"use client";

import Button from "@/components/Button";

const Favorites = () => {
  const res = () => {
    console.log("respons recorded");
  };
  return (
    <div className="flex flex-col p-4">
      <div>
        <h1>Requests</h1>
        <div className="flex justify-between items-center max-w-[60%] bg-gray-500 p-4 rounded-sm shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 bg-gray-700 rounded-full cursor-pointer flex items-center justify-center shadow-md hover:bg-gray-600 transition">
              <span className="font-bold">P</span>
            </div>
            <h2>Amir Send You A Friend Request</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={res}
              className="bg-green-500 p-2 rounded-sm hover:bg-green-600 text-white"
            >
              Accept
            </Button>
            <Button
              onClick={res}
              className="bg-red-500 p-2 rounded-sm hover:bg-red-600 text-white"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
      <div>
        <h1>Other</h1>
      </div>
    </div>
  );
};

export default Favorites;
