import { useState, useEffect } from "react";

export enum ILocalStorageItems {
  CONTACTS = "CONTACTS",
  TOTAL_DATA = "TOTAL_DATA",
  CURRENT_PAGE = "CURRENT_PAGE",
  FILTER = "FILTER",
  PINNED = "PINNED",
  SELECTED_CONTACTS = "SELECTED_CONTACTS",
}

function useLocalStorage<T>(
  key: ILocalStorageItems,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState(() => {
    const storedValue =
      typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
