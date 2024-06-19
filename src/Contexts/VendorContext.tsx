import React, { createContext, useState, ReactNode } from "react";
import { Vendor } from "types/types";

interface VendorContextType {
  vendor: Vendor;
  setVendor: React.Dispatch<React.SetStateAction<Vendor>>;
}

interface VendorProviderProps {
  children: ReactNode;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

const VendorProvider = (props: VendorProviderProps) => {
  const [vendor, setVendor] = useState<Vendor>({
    id: "",
    name: "",
    address: "",
  });
  const { children } = props;

  return (
    <VendorContext.Provider value={{ vendor, setVendor }}>
      {children}
    </VendorContext.Provider>
  );
};

export { VendorContext, VendorProvider };
