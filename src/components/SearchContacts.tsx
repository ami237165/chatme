"use client";
import { useDebounce } from "use-debounce";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DiscoverUserList from "./DiscoverUserList";
import { useSearchQuery } from "@/store/apiServices/userApi";

interface SearchContactsProps {
  query: string;
  isAuthChecked:boolean
}

const SearchContacts: React.FC<SearchContactsProps> = ({ query,isAuthChecked }) => {
  const currentMobile = useSelector((state: any) => state.auth.currentMobile);

  const [debouncedQuery] = useDebounce(query, 400);

  const { data, isLoading, error } = useSearchQuery(debouncedQuery, {
    skip: debouncedQuery.length < 1, // only search if >=1 char
  });

  const users = debouncedQuery.length < 2 ? [] : data?.data ?? [];

  if (isLoading)
    return <p className="mt-2 text-sm text-gray-500">Searching...</p>;
  if (error) return <p className="mt-2 text-sm text-red-500">Error occurred</p>;

  if (!isLoading && users.length === 0 && debouncedQuery.length >= 1) {
    return <p className="mt-2 text-sm text-gray-400">No users found</p>;
  }

  return (
    users.length > 0 && (
      <ul className="flex flex-col items-center overflow-y-scroll max-h-50 bg-gray-700 rounded-lg shadow-lg w-full pb-2 scroll-smooth hide-scrollbar">
        {users
          .filter((user: any) => user?.mobileNumber !== currentMobile)
          .map((item: any) => (
            <DiscoverUserList
            key={item.id}
            isAuthChecked={isAuthChecked}
              id={item.id}
              name={item.name}
              mobile={item.mobileNumber}
            />
          ))}
      </ul>
    )
  );
};



export default SearchContacts;
