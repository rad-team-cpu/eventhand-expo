import { useAuth } from "@clerk/clerk-expo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  screen,
  render,
  waitFor,
  userEvent,
  cleanup,
} from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import * as React from "react";

import Profile from "../index";

jest.mock("@clerk/clerk-expo");

let mockSignOut: jest.Mock;
let user: UserEventInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockSignOut = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    isLoaded: true,
    signOut: mockSignOut,
  });

  render(<Profile />);

  user = userEvent.setup();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("Profile", () => {
  it("Should allow the user to logout hisher session", async () => {
    const signOutButton = screen.getByRole("button", { name: "Sign Out" });

    await user.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

});
