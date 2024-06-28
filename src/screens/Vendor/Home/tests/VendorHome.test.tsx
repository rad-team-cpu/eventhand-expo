import { useAuth, useUser } from "@clerk/clerk-expo";
import { faker } from "@faker-js/faker";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  screen,
  render,
  waitFor,
  cleanup,
  userEvent,
} from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import { VendorContext } from "Contexts/VendorContext";
import fetch from "jest-fetch-mock";
import * as React from "react";
import VendorProfileForm from "screens/Vendor/Profile/Form";
import { ScreenProps, Vendor } from "types/types";

import VendorHome from "..";

const setVendorMock = jest.fn();

const mockVendor: Vendor = {
  id: "",
  name: "",
  address: "",
  email: "",
  contactNumber: "",
};

const TestVendorHomeComponent = () => {
  const TestVendorHomeStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <VendorContext.Provider
        value={{ vendor: mockVendor, setVendor: setVendorMock }}
      >
        <TestVendorHomeStack.Navigator>
          <TestVendorHomeStack.Screen
            name="VendorHome"
            component={VendorHome}
          />
          <TestVendorHomeStack.Screen
            name="VendorProfileForm"
            component={VendorProfileForm}
          />
        </TestVendorHomeStack.Navigator>
      </VendorContext.Provider>
    </NavigationContainer>
  );
};

let mockGetToken: jest.Mock;
const mockUserId = "mock-user-id";
const token = "mock-jwt-token";
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

let user: UserEventInstance;

beforeEach(async () => {
  jest.useFakeTimers();
  mockGetToken = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    userId: mockUserId,
    isLoaded: true,
    getToken: mockGetToken.mockReturnValue(token),
  });

  (useUser as jest.Mock).mockReturnValue({
    user: {
      primaryEmailAddress: {
        emailAddress: "mockEmail@mock.com",
      },
    },
  });

  user = userEvent.setup();
});

afterEach(() => {
  fetch.resetMocks();
  jest.useRealTimers();
  jest.clearAllMocks();
  jest.restoreAllMocks();
  cleanup();
});

describe("VendorHome", () => {
  it("Should navigate to vendor profile form,if no vendor data is found in the backend", async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors/clerk=${mockUserId}`;

    fetch.once(url, {
      status: 404,
      headers,
    });

    await waitFor(() => {
      render(<TestVendorHomeComponent />);
    });

    const request = {
      method: "GET",
      headers,
    };

    const profileScreen = screen.getByTestId("test-vendor-profile-form-field");
    const logoUploadImage = screen.getByTestId("test-profile-upload-image");
    const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByTestId("test-email-text-input");
    const currentEmailButton = screen.getByTestId("test-current-email-button");
    const contactNumberInput = screen.getByPlaceholderText("Contact No.");
    const nextButton = screen.getByRole("button", { name: "NEXT" });

    await waitFor(async () => {
      expect(mockGetToken).toHaveBeenCalledWith({ template: "event-hand-jwt" });
      expect(fetch).toHaveBeenCalledWith(url, request);
      expect(profileScreen).toBeOnTheScreen();
      expect(logoUploadImage).toBeOnTheScreen();
      expect(logoUploadBtn).toBeOnTheScreen();
      expect(nameInput).toBeOnTheScreen();
      expect(emailInput).toBeOnTheScreen();
      expect(currentEmailButton).toBeOnTheScreen();
      expect(contactNumberInput).toBeOnTheScreen();
      expect(nextButton).toBeOnTheScreen();
    });
  });
});
