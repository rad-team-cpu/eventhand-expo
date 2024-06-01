import React, { ReactNode, createContext, useState } from "react";

import { UserProfile } from "../../../src/types/types";

interface UserContextType {
  user: UserProfile;
  setUser: jest.Mock;
}

const mockUser: UserProfile = {
  lastName: "Doe",
  firstName: "John",
  contactNumber: "1234567890",
  gender: "male",
  events: [],
  chats: [],
  vendorId: "vendor123",
};

const setUser = jest.fn();

const UserContext = createContext<UserContextType | undefined>({
  user: mockUser,
  setUser,
});

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider = (props: UserProviderProps) => {
  const { children } =  props
  const [user, setUserState] = useState(mockUser);

  return (
    <UserContext.Provider value={{ user, setUser: setUser as jest.Mock }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider, setUser };
