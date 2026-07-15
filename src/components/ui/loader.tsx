"use client";

import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

const Loader = ({
  size = "md",
  fullScreen = false,
  text,
}: LoaderProps) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-300 border-t-blue-600 animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4">
      {content}
    </div>
  );
};

export default Loader;