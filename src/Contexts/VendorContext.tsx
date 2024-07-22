import React, { createContext, useState, ReactNode } from "react";
import { Vendor } from "types/types";

interface VendorProfile {
  id: string;
  logo?: string | undefined;
  name: string;
  email: string;
  address?: string;
  contactNumber: string;
}

interface VendorContextType {
  vendor: VendorProfile;
  setVendor: React.Dispatch<React.SetStateAction<VendorProfile>>;
}

interface VendorProviderProps {
  children: ReactNode;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

const VendorProvider = (props: VendorProviderProps) => {
  const [vendor, setVendor] = useState<VendorProfile>({
    id: "",
    name: "",
    address: "",
    email: "",
    contactNumber: "",
  });
  const { children } = props;

  return (
    <VendorContext.Provider value={{ vendor, setVendor }}>
      {children}
    </VendorContext.Provider>
  );
};

export { VendorContext, VendorProvider };
