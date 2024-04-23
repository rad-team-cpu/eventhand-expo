import { SignedOut, useSignIn } from "@clerk/clerk-expo";
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
import * as React from "react";

import Login from ".";

jest.mock("@clerk/clerk-expo");

const Stack = createNativeStackNavigator;

let mockCreate: jest.Mock;
let mockSetActive: jest.Mock;
let user: UserEventInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockCreate = jest.fn();
  mockSetActive = jest.fn();

  (useSignIn as jest.Mock).mockReturnValue({
    isLoaded: true,
    signIn: {
      create: mockCreate,
    },
    setActive: mockSetActive,
  });

  render(
    <NavigationContainer>
      <SignedOut/>
    </NavigationContainer>,
  );
  user = userEvent.setup();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("Login", () => {
  const testData = [
    { email: "test@example.com", password: "StrongP@ss1" },
    { email: "user123@gmail.com", password: "Secur3Password" },
    { email: "john.doe@yahoo.com", password: "Passw0rd123" },
    { email: "jane_doe123@hotmail.com", password: "Abcd1234" },
    { email: "info@company.com", password: "NewP@ssw0rd" },
    { email: "support@website.org", password: "1AaBbCcDd" },
    { email: "admin@admin.net", password: "P@ssw0rd!" },
    { email: "contact_us@domain.info", password: "12345Abcd" },
    { email: "hello+world@subdomain.co", password: "Qwerty12" },
    { email: "user.name@domain.com", password: "Pa$$w0rd" },
    { email: "another.user@example.com", password: "An0therP@ss" },
    { email: "testuser123@domain.com", password: "TestUser123" },
    { email: "support_team@website.org", password: "Support123!" },
    { email: "admin_user@company.net", password: "Adm1nPa$$" },
    { email: "newcustomer@domain.com", password: "Customer@123" },
  ];

  it.each(testData)(
    "Should allow user to input the email and password of the user",
    async (data) => {
      const emailInput = screen.getByPlaceholderText("Email");

      await user.type(emailInput, data.email);

      await waitFor(() => {
        expect(emailInput.props.value).toBe(data.email);
      });

      const emailErrText = screen.getByTestId("email-err-text");
      const passwordInput = screen.getByPlaceholderText("Password");
      const passwordErrText = screen.getByTestId("password-err-text");

      await user.type(passwordInput, data.password);

      await waitFor(() => {
        expect(emailInput.props.value).toBe(data.email);
        expect(passwordInput.props.value).toBe(data.password);
        expect(emailErrText.children[0]).toBeFalsy();
        expect(passwordErrText.children[0]).toBeFalsy();
      });
    },
  );

  it("Should display an error text and disable Login button if the fields are empty", () => {
    const emailInput = screen.getAllByPlaceholderText("");
  });
});
