import { useSignIn, useSignUp } from "@clerk/clerk-expo";
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
import { ScreenProps } from "../../Navigation/types";
import SignupForm from "../SignUp";

jest.mock("@clerk/clerk-expo");

const Stack = createNativeStackNavigator<ScreenProps>();

let mockSignIn: jest.Mock;
let mockSetActive: jest.Mock;
let user: UserEventInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockSignIn = jest.fn();
  mockSetActive = jest.fn();

  (useSignIn as jest.Mock).mockReturnValue({
    isLoaded: true,
    signIn: {
      create: mockSignIn,
    },
    setActive: mockSetActive,
  });

  render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="SignUp" component={SignupForm} />
      </Stack.Navigator>
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
    "Should accept a valid email and password from the user",
    async (data) => {
      const mockCompleteSignIn = {
        createdSessionId: "mocked-session-id",
      };

      mockSignIn.mockResolvedValueOnce(mockCompleteSignIn);

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

      const loginButton = screen.getByRole("button", { name: "Login" });

      await user.press(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          identifier: data.email,
          password: data.password,
        });
        expect(mockSetActive).toHaveBeenCalledWith({
          session: mockCompleteSignIn.createdSessionId,
        });
      });
    },
  );

  it("Should display an error text and disable Login button if the fields are empty", async () => {
    const emailInput = screen.getByPlaceholderText("Email");
    const loginButton = screen.getByRole("button", { name: "Login" });
    const emailErrText = screen.getByTestId("email-err-text");

    await user.type(emailInput, "");

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeTruthy();
      expect(loginButton).toBeDisabled();
    });

    const passwordInput = screen.getByPlaceholderText("Password");
    const passwordErrText = screen.getByTestId("password-err-text");

    await user.type(passwordInput, "");

    await waitFor(() => {
      expect(passwordErrText.children[0]).toBeTruthy();
      expect(loginButton).toBeDisabled();
    });
  });

  it("Should display a loading screen on Login", async () => {
    const mockCompleteSignIn = {
      createdSessionId: "mocked-session-id",
    };

    mockSignIn.mockResolvedValueOnce(
      new Promise((resolve) => {
        setTimeout(() => resolve(mockCompleteSignIn), 3000);
      }),
    );

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, testData[0].email);
    await user.type(passwordInput, testData[0].password);
    await user.press(loginButton);

    const loadingIndicator = screen.getByTestId("test-loading");

    await waitFor(() => {
      expect(loadingIndicator).toBeOnTheScreen();
    });
  });

  it("Should display an error text on Login error", async () => {
    const mockError = {
      errors: [{ message: "Login Error" }],
    };

    mockSignIn.mockRejectedValueOnce(mockError);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    await user.type(emailInput, testData[0].email);
    await user.type(passwordInput, testData[0].password);
    await user.press(loginButton);

    const loginErrText = screen.getByTestId("login-err-text");

    await waitFor(() => {
      expect(loginErrText.children[0]).toBeTruthy();
    });
  });

  it("Should navigate to Sign Up screen on sign up text press", async () => {
    (useSignUp as jest.Mock).mockReturnValue({
      isLoaded: true,
    });

    const signUpNavButton = screen.getByTestId("signup-btn-nav");

    await user.press(signUpNavButton);

    const signUpForm = screen.getByTestId("test-signup-form")

    await waitFor(() => {
      expect(signUpForm).toBeOnTheScreen();
    })
  })
});
