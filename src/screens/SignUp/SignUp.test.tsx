import { useSignUp } from "@clerk/clerk-expo";
import {
  screen,
  render,
  waitFor,
  userEvent,
  cleanup,
} from "@testing-library/react-native";
import * as React from "react";

import SignupForm from ".";

jest.mock("@clerk/clerk-expo");

let mockCreate: jest.Mock;
let mockPrepareEmailVerification: jest.Mock;
let mockSetActive: jest.Mock;
let mockAttemptEmailAddressVerification: jest.Mock;

beforeEach(() => {
  jest.useFakeTimers();
  mockCreate = jest.fn();
  mockPrepareEmailVerification = jest.fn();
  mockSetActive = jest.fn();
  mockAttemptEmailAddressVerification = jest.fn();

  (useSignUp as jest.Mock).mockReturnValue({
    isLoaded: true,
    signUp: {
      create: mockCreate,
      prepareEmailAddressVerification: mockPrepareEmailVerification,
      attemptEmailAddressVerification: mockAttemptEmailAddressVerification,
    },
    setActive: mockSetActive,
  });

  render(<SignupForm />);
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("SignUpForm", () => {
  const validData = [
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
  ];

  const invalidData = [
    { email: "invalid_email.com", password: "passw0rd" }, // email missing "@" symbol and pass missing uppercase letter
    { email: "user@domain", password: "short1" }, // email missing top-level domain, and pass isless than 8 characters long
    { email: "user@domain.", password: "ALLLOWERCASE" }, // email has trailing dot in domain and pass is  missing a digit
    { email: "user@domaincom", password: "NoNumberHere" }, // email has a missing dot between domain and top-level domain while password has a missing digit
    { email: "user@domain!com", password: "P@ss" }, // special character "!" not allowed in domain in email  and password is less than 8 characters long, missing digit
  ];

  it("should renders Sign Up form inputs", async () => {
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });

    await waitFor(() => {
      expect(emailInput).toBeOnTheScreen();
      expect(passwordInput).toBeOnTheScreen();
      expect(confirmPasswordInput).toBeOnTheScreen();
      expect(signUpButton).toBeOnTheScreen();
    });
  });

  it.each(validData)(`should accept %s as a valid email`, async (data) => {
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.type(emailInput, data.email);

    await waitFor(() => {
      expect(emailInput.props.value).toBe(data.email);
    });

    await user.press(passwordInput);

    const emailErrText = screen.getByTestId("email-err-text");

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeFalsy();
    });
  });

  it.each(invalidData)(
    `should recognize %s as an invalid email`,
    async (data) => {
      const user = userEvent.setup();

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");

      await user.type(emailInput, data.email);

      await waitFor(() => {
        expect(emailInput.props.value).toBe(data.email);
      });

      await user.press(passwordInput);

      const emailErrText = screen.getByTestId("email-err-text");

      await waitFor(() => {
        expect(emailErrText.children[0]).toBeTruthy();
      });
    },
  );

  it(`should re-validate email on change of input`, async () => {
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const validEmail = validData[0].email;
    const invalidEmail = invalidData[0].email;

    await user.type(emailInput, invalidEmail);

    await waitFor(() => {
      expect(emailInput.props.value).toBe(invalidEmail);
    });

    await user.press(passwordInput);

    const emailErrText = screen.getByTestId("email-err-text");

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeTruthy();
    });

    await user.type(emailInput, validEmail);

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeFalsy();
    });
  });

  it.each(validData)(`should accept %s as a valid password`, async (data) => {
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");

    await user.type(passwordInput, data.password);

    await waitFor(() => {
      expect(passwordInput.props.value).toBe(data.password);
    });

    await user.press(confirmPasswordInput);

    const passwordErrText = screen.getByTestId("password-err-text");

    await waitFor(() => {
      expect(passwordErrText.children[0]).toBeFalsy();
    });
  });

  it.each(invalidData)(
    `should recognize %s as an invalid password`,
    async (data) => {
      const user = userEvent.setup();

      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-type Password");

      await user.type(passwordInput, data.password);

      await waitFor(() => {
        expect(passwordInput.props.value).toBe(data.password);
      });

      await user.press(confirmPasswordInput);

      const passwordErrText = screen.getByTestId("password-err-text");

      await waitFor(() => {
        expect(passwordErrText.children[0]).toBeTruthy();
      });
    },
  );

  it(`should re-validate password on change of input`, async () => {
    const user = userEvent.setup();

    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const invalidPassword = invalidData[0].password;
    const validPassword = validData[0].password;

    await user.type(passwordInput, invalidPassword);

    await waitFor(() => {
      expect(passwordInput.props.value).toBe(invalidPassword);
    });

    await user.press(confirmPasswordInput);

    const passwordErrText = screen.getByTestId("password-err-text");

    await waitFor(() => {
      expect(passwordErrText.children[0]).toBeTruthy();
    });

    await user.type(passwordInput, validPassword);

    await waitFor(() => {
      expect(passwordErrText.children[0]).toBeFalsy();
    });
  });

  it.each(invalidData)(
    `should display error if user passwords do not match`,
    async (data) => {
      const user = userEvent.setup();

      const passwordInput = screen.getByPlaceholderText("Password");
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-type Password");

      await user.type(passwordInput, data.password);
      await user.type(confirmPasswordInput, data.password);

      await waitFor(() => {
        expect(passwordInput).toBeTruthy();
        expect(confirmPasswordInput.props.value).toBe(data.password);
      });

      await user.press(passwordInput);

      const confirmPasswordErrText = screen.getByTestId(
        "confirm-password-err-text",
      );

      await waitFor(() => {
        expect(confirmPasswordErrText.children[0]).toBeFalsy();
      });

      const unmatchedPassword = "Password123";

      await user.type(confirmPasswordInput, unmatchedPassword);

      await waitFor(() => {
        expect(confirmPasswordErrText.children[0]).toBeTruthy();
      });
    },
  );

  it("Should disable sign up button and display error text if fields are empty", async () => {
    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });

    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });

    const emailErrText = screen.getByTestId("email-err-text");

    await user.type(emailInput, "");
    await user.press(confirmPasswordInput);

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeTruthy();
    });

    const passwordErrText = screen.getByTestId("password-err-text");

    await user.type(passwordInput, "");
    await user.press(emailInput);

    await waitFor(() => {
      expect(passwordErrText.children[0]).toBeTruthy();
    });

    const confirmPasswordErrText = screen.getByTestId(
      "confirm-password-err-text",
    );

    await user.type(confirmPasswordInput, "");
    await user.press(passwordInput);

    await waitFor(() => {
      expect(confirmPasswordErrText.children[0]).toBeTruthy();
    });

    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it.each(validData)(
    "should call signUp.create and signUp.prepareEmailAddressVerification on signUp button press with valid inputs ",
    async (data) => {
      const user = userEvent.setup();

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const signUpButton = screen.getByRole("button", { name: "Sign Up" });
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-type Password");
      const expectedInput = {
        emailAddress: data.email,
        password: data.password,
      };

      await user.type(emailInput, expectedInput.emailAddress);
      await user.type(passwordInput, expectedInput.password);
      await user.type(confirmPasswordInput, expectedInput.password);
      await user.press(signUpButton);

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expectedInput);
        expect(mockPrepareEmailVerification).toHaveBeenCalledWith({
          strategy: "email_code",
        });
      });
    },
  );

  it("should display a loading screen on pressing the sign up button", async () => {
    mockCreate.mockResolvedValueOnce(
      new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    mockPrepareEmailVerification.mockResolvedValueOnce(
      new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const expectedInput = {
      emailAddress: validData[0].email,
      password: validData[0].password,
    };

    await user.type(emailInput, expectedInput.emailAddress);
    await user.type(passwordInput, expectedInput.password);
    await user.type(confirmPasswordInput, expectedInput.password);
    await user.press(signUpButton);

    jest.advanceTimersByTime(1000);

    const loadingIndicator = screen.getByTestId("test-loading");

    await waitFor(() => {
      expect(loadingIndicator).toBeOnTheScreen();
    });

    waitFor(() => {
      expect(screen.queryByTestId("test-loading")).toBeNull();
    });
  });

  it("should display error text on Sign up error", async () => {
    mockCreate.mockRejectedValueOnce(
      // eslint-disable-next-line prefer-promise-reject-errors
      { errors: [{ message: "sign up error" }] },
    );

    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const expectedInput = {
      emailAddress: validData[0].email,
      password: validData[0].password,
    };

    await user.type(emailInput, expectedInput.emailAddress);
    await user.type(passwordInput, expectedInput.password);
    await user.type(confirmPasswordInput, expectedInput.password);
    await user.press(signUpButton);

    const emailErrText = screen.getByTestId("email-err-text");
    const passwordErrText = screen.getByTestId("password-err-text");
    const confirmPasswordErrText = screen.getByTestId(
      "confirm-password-err-text",
    );
    const signUpErrText = screen.getByTestId("signup-err-text");
    const signUpForm = screen.queryByTestId("test-signup-form");
    const loadingIndicator = screen.queryByTestId("test-loading");

    await waitFor(() => {
      expect(emailErrText.children[0]).toBeFalsy();
      expect(passwordErrText.children[0]).toBeFalsy();
      expect(confirmPasswordErrText.children[0]).toBeFalsy();
      expect(signUpErrText.children[0]).toBeTruthy();
      expect(signUpForm).toBeOnTheScreen();
      expect(loadingIndicator).toBeNull();
    });
  });

  it.each(validData)(
    "should call useSignUp attemptEmailVerification and setActive on successful verification ",
    async (data) => {
      const mockCompleteSignUp = {
        createdSessionId: "mocked-session-id",
      };

      mockAttemptEmailAddressVerification.mockResolvedValueOnce(
        mockCompleteSignUp,
      );

      const user = userEvent.setup();

      const emailInput = screen.getByPlaceholderText("Email");
      const passwordInput = screen.getByPlaceholderText("Password");
      const signUpButton = screen.getByRole("button", { name: "Sign Up" });
      const confirmPasswordInput =
        screen.getByPlaceholderText("Re-type Password");
      const expectedInput = {
        emailAddress: data.email,
        password: data.password,
      };

      await user.type(emailInput, expectedInput.emailAddress);
      await user.type(passwordInput, expectedInput.password);
      await user.type(confirmPasswordInput, expectedInput.password);
      await user.press(signUpButton);

      jest.advanceTimersByTime(500);

      const codeInput = screen.getByPlaceholderText("Code");
      const verifyButton = screen.getByRole("button", { name: "Verify" });
      const signUpForm = screen.queryByTestId("test-signup-form");
      const testCode = "code123";

      await waitFor(() => {
        expect(signUpForm).toBeNull();
        expect(codeInput).toBeOnTheScreen();
        expect(verifyButton).toBeOnTheScreen();
      });

      const verificationErrText = screen.getByTestId("verify-err-text");

      await user.type(codeInput, testCode);
      await user.press(verifyButton);

      await waitFor(() => {
        expect(mockAttemptEmailAddressVerification).toHaveBeenCalledWith({
          code: testCode,
        });
        expect(mockSetActive).toHaveBeenCalledWith({
          session: mockCompleteSignUp.createdSessionId,
        });
        expect(verificationErrText).toBeEmptyElement();
      });
    },
  );

  it("should display a loading screen while verifying", async () => {
    const mockCompleteSignUp = {
      createdSessionId: "mocked-session-id",
    };

    mockAttemptEmailAddressVerification.mockResolvedValueOnce(
      new Promise((resolve) => {
        setTimeout(resolve, 1000);
        return mockCompleteSignUp;
      }),
    );

    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const expectedInput = {
      emailAddress: validData[0].email,
      password: validData[0].password,
    };

    await user.type(emailInput, expectedInput.emailAddress);
    await user.type(passwordInput, expectedInput.password);
    await user.type(confirmPasswordInput, expectedInput.password);
    await user.press(signUpButton);

    const codeInput = screen.getByPlaceholderText("Code");
    const verifyButton = screen.getByRole("button", { name: "Verify" });
    const signUpForm = screen.queryByTestId("test-signup-form");
    const testCode = "code123";

    await waitFor(() => {
      expect(signUpForm).toBeNull();
      expect(codeInput).toBeOnTheScreen();
      expect(verifyButton).toBeOnTheScreen();
    });

    await user.type(codeInput, testCode);
    await user.press(verifyButton);

    const loadingIndicator = screen.getByTestId("test-loading");

    await waitFor(() => {
      expect(loadingIndicator).toBeOnTheScreen();
    });

    waitFor(() => {
      expect(screen.queryByTestId("test-loading")).toBeNull();
    });
  });

  it("should display an error text on verification error ", async () => {
    const mockError = {
      errors: [{ message: "Verification Error" }],
    };

    mockAttemptEmailAddressVerification.mockRejectedValueOnce(mockError);

    const user = userEvent.setup();

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const signUpButton = screen.getByRole("button", { name: "Sign Up" });
    const confirmPasswordInput =
      screen.getByPlaceholderText("Re-type Password");
    const expectedInput = {
      emailAddress: validData[0].email,
      password: validData[0].password,
    };

    await user.type(emailInput, expectedInput.emailAddress);
    await user.type(passwordInput, expectedInput.password);
    await user.type(confirmPasswordInput, expectedInput.password);
    await user.press(signUpButton);

    const codeInput = screen.getByPlaceholderText("Code");
    const verifyButton = screen.getByRole("button", { name: "Verify" });
    const signUpForm = screen.queryByTestId("test-signup-form");
    const testCode = "code123";

    await waitFor(() => {
      expect(signUpForm).toBeNull();
      expect(codeInput).toBeOnTheScreen();
      expect(verifyButton).toBeOnTheScreen();
    });

    const verificationErrText = screen.getByTestId("verify-err-text");

    await user.type(codeInput, testCode);
    await user.press(verifyButton);

    await waitFor(() => {
      expect(verificationErrText.children[0]).toBeTruthy();
    });
  });
});
