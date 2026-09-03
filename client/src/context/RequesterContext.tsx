import React, { createContext, useContext, useState } from "react";
import { RequesterUser } from "../types";

interface RequesterContextType {
  selectedRequester: RequesterUser | null;
  setSelectedRequester: (user: RequesterUser | null) => void;
  clearRequester: () => void;
}

const STORAGE_KEY = "toktickit_selected_requester";

export const DEFAULT_REQUESTER: RequesterUser = {
  id: 1,
  name: "Jennifer Anderson",
  email: "jennifer.a@example.com",
};

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRequester, setSelectedRequesterState] = useState<RequesterUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_REQUESTER;
    } catch {
      return DEFAULT_REQUESTER;
    }
  });

  const setSelectedRequester = (user: RequesterUser | null) => {
    setSelectedRequesterState(user);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearRequester = () => {
    setSelectedRequester(null);
  };

  return (
    <RequesterContext.Provider value={{ selectedRequester, setSelectedRequester, clearRequester }}>
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = (): RequesterContextType => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error("useRequester must be used within a RequesterProvider");
  }
  return context;
};
