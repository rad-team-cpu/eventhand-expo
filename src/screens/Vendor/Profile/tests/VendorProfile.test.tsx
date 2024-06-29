import { useAuth, useUser } from "@clerk/clerk-expo";
import { faker } from "@faker-js/faker";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  screen,
  render,
  waitFor,
  userEvent,
  cleanup,
} from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import { VendorContext } from "Contexts/VendorContext";
import * as React from "react";
import VendorHome from "screens/Vendor/Home";
import { ScreenProps, UserProfile, Vendor } from "types/types";

import {
  getDownloadURL,
  getStorage,
  ref,
} from "../../../../../test/__mocks__/firebase/storage";
import Confirmation from "screens/Confirmation";

interface TestVendorProfileComponentProps {
  mockVendor: Vendor;
}

const setVendorMock = jest.fn();

const mockVendor: Vendor = {
  id: "mock-id",
  logo: faker.image.avatar(),
  name: faker.company.name(),
  email: faker.internet.email(),
  contactNumber: `09${faker.string.numeric(9)}`,
};

const TestVendorProfileComponent = (props: TestVendorProfileComponentProps) => {
  const { mockVendor } = props;
  const TestVendorProfileStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <VendorContext.Provider
        value={{ vendor: mockVendor, setVendor: setVendorMock }}
      >
        <TestVendorProfileStack.Navigator>
          <TestVendorProfileStack.Screen
            name="VendorHome"
            component={VendorHome}
            initialParams={{ initialTab: "Profile", noFetch: true }}
          />
          <TestVendorProfileStack.Screen
            name="Confirmation"
            component={Confirmation}
            options={{ headerShown: false }}
          />
        </TestVendorProfileStack.Navigator>
      </VendorContext.Provider>
    </NavigationContainer>
  );
};

let mockSignOut: jest.Mock;
let user: UserEventInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockSignOut = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    isLoaded: true,
    signOut: mockSignOut,
  });

  (useUser as jest.Mock).mockReturnValue({
    user: {
      primaryEmailAddress: {
        emailAddress: mockVendor.email,
      },
    },
  });

  user = userEvent.setup();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("Profile", () => {
  it("Should allow the user to logout his/her session", async () => {
    await waitFor(() => {
      render(<TestVendorProfileComponent mockVendor={mockVendor} />);
    });

    const signOutButton = screen.getByRole("button", { name: "Sign Out" });

    await user.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("Should call firebase service to download logo url from firebase storage", async () => {
    await waitFor(() => {
      render(<TestVendorProfileComponent mockVendor={mockVendor} />);
    });

    await waitFor(() => {
      expect(ref).toHaveBeenCalledWith(getStorage(), mockVendor.logo);
      expect(getDownloadURL).toHaveBeenCalledWith(ref());
    });
  });

  it("should display the user's name, avatar, contact number, and emailAddress ", async () => {
    const mockAvatar = mockVendor.logo;
    getDownloadURL.mockResolvedValue(mockAvatar);

    await waitFor(() => {
      render(<TestVendorProfileComponent mockVendor={mockVendor} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("test-avatar-label")).toHaveTextContent(
        mockVendor.name,
      );
      expect(screen.getByTestId("test-profile-contact-num")).toHaveTextContent(
        mockVendor.contactNumber,
      );
      expect(screen.getByTestId("test-profile-email")).toHaveTextContent(
        mockVendor.email,
      );
      expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
        mockVendor.logo,
      );
    });
  });

  it("should display a default avatar image if user has no saved avatar", async () => {
    const mockVendor: Vendor = {
      id: "mock-id",
      name: faker.company.name(),
      email: faker.internet.email(),
      contactNumber: `09${faker.string.numeric(9)}`,
    };

    const defaultImage = require("../../../../assets/images/user.png");

    await waitFor(() => {
      render(<TestVendorProfileComponent mockVendor={mockVendor} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("test-avatar-image").props.source).toBe(
        defaultImage,
      );
    });
  });

  it("should proceed to a confirmation screen when the client button is pressed", async () => {
    await waitFor(() => {
      render(<TestVendorProfileComponent mockVendor={mockVendor} />);
    });

    user.press(screen.getByRole("button", { name: "Client Mode" }));

    await waitFor(() => {
      expect(screen.getByTestId("test-confirmation-dialog")).toBeOnTheScreen();
    });
  });
});
