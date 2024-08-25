import React, { createContext, useState, ReactNode } from "react";
import { UserProfile, UserMode, EventInfo, EventList } from "types/types";

interface UserContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switching: boolean;
  setSwitching: React.Dispatch<React.SetStateAction<boolean>>;
  mode: UserMode
  setMode: React.Dispatch<React.SetStateAction<UserMode>>;
  eventList: EventList,
  setEventList: React.Dispatch<React.SetStateAction<EventList>>;
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
  });
  const [ eventList, setEventList ] = useState<EventInfo[]>([]);


  const { children } = props;

  return (
    <UserContext.Provider value={{ user, setUser, switching, setSwitching, mode, setMode, eventList, setEventList }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
