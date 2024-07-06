import React, { createContext, useState, ReactNode } from "react";
import { UserProfile } from "types/types";

interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = (props: UserProviderProps) => {
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
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
