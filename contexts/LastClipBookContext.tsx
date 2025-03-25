import React, { createContext, useContext, useState } from "react";
import { Book } from "../constants/MockData";

interface LastClipBookContextType {
  lastClipBook: Book | null;
  setLastClipBook: (book: Book | null) => void;
}

const LastClipBookContext = createContext<LastClipBookContextType | undefined>(
  undefined
);

export function LastClipBookProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lastClipBook, setLastClipBook] = useState<Book | null>(null);

  return (
    <LastClipBookContext.Provider value={{ lastClipBook, setLastClipBook }}>
      {children}
    </LastClipBookContext.Provider>
  );
}

export function useLastClipBook() {
  const context = useContext(LastClipBookContext);
  if (context === undefined) {
    throw new Error(
      "useLastClipBook must be used within a LastClipBookProvider"
    );
  }
  return context;
}
