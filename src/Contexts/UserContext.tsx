import React, { createContext, useState, ReactNode } from "react";
import { UserProfile, UserMode } from "types/types";

interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switching: boolean;
  setSwitching: React.Dispatch<React.SetStateAction<boolean>>;
  mode: UserMode
  setMode: React.Dispatch<React.SetStateAction<UserMode>>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = (props: UserProviderProps) => {
  const [switching, setSwitching] = useState<boolean>(false);
  const [mode, setMode] = useState<UserMode>("CLIENT")
  const [user, setUser] = useState<UserProfile>({
    _id: "",
    email: "",
    lastName: "",
    firstName: "",
    contactNumber: "",
    gender: "",
    events: [],
    chats: [],
    vendorId: "",
  });
  const { children } = props;

  return (
    <UserContext.Provider value={{ user, setUser, switching, setSwitching, mode, setMode }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
