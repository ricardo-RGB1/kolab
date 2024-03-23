"use client";

import qs from "query-string";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * A component that renders a search input field.
 */
export const SearchInput = () => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounce(value, 500); // Debounce the value to prevent too many requests.

  /**
   * Handles the change event of the input field.
   * @param e - The change event object.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  /**
   * Constructs a URL with a search query parameter based on the provided debounced value.
   * @param debouncedValue - The debounced value to be used as the search query.
   * @returns The constructed URL with the search query parameter.
   */
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: {
          search: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [debouncedValue, router]);

  return (
    <div className="w-full relative">
      <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        className="w-full max-w-[516px] pl-9"
        placeholder="Search boards"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
