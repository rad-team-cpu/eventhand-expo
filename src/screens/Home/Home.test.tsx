import { useAuth } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import {
  screen,
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import * as React from "react";

import Home from ".";

jest.mock("@clerk/clerk-expo");

beforeEach(() => {
  render(
    <NavigationContainer>
      <Home />
    </NavigationContainer>,
  );
});

describe("Home", () => {
  it("shows the booking feature if the booking button is pressed in the bottom navigation bar", async () => {
    fireEvent.press(screen.getByTestId("booking-nav-btn"));

    waitFor(() => {
      expect(screen.getByTestId("booking")).toBeOnTheScreen();
    });
  });

  it("shows the Chat feature if the chat button is pressed in the bottom navigation bar", async () => {
    fireEvent.press(screen.getByTestId("chat-nav-btn"));

    waitFor(() => {
      expect(screen.getByTestId("chat")).toBeOnTheScreen();
    });
  });

  it("shows the Profile feature if the profile button is pressed in the bottom navigation bar", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
    });

    fireEvent.press(screen.getByTestId("profile-nav-btn"));

    waitFor(() => {
      expect(screen.getByTestId("test-profile")).toBeOnTheScreen();
    });
  });
});
