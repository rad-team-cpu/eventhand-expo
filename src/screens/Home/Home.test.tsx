import { NavigationContainer } from "@react-navigation/native";
import {
  screen,
  render,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import * as React from "react";

import Home from ".";

describe("Home", () => {
  it("shows the booking feature if the booking button is pressed in the bottom navigation bar", async () => {
    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId("booking-nav-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("booking")).toBeOnTheScreen();
    });
  });

  it("shows the Chat feature if the chat button is pressed in the bottom navigation bar", async () => {
    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId("chat-nav-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("chat")).toBeOnTheScreen();
    });
  });

  it("shows the Settings feature if the settings button is pressed in the bottom navigation bar", async () => {
    render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>,
    );

    fireEvent.press(screen.getByTestId("settings-nav-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("settings")).toBeOnTheScreen();
    });
  });
});
