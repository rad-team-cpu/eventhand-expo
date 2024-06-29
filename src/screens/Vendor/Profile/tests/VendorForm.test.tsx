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
import { UploadResult } from "firebase/storage";
import fetch from "jest-fetch-mock";
import * as React from "react";
import VendorHome from "screens/Vendor/Home";
import VendorProfileForm from "screens/Vendor/Profile/Form";
import FirebaseService from "service/firebase";
import { ImageInfo, ScreenProps, Vendor } from "types/types";

import { getInfoAsync } from "../../../../../test/__mocks__/expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "../../../../../test/__mocks__/expo-image-picker";
import SuccessError from "screens/SuccessError";

const setVendorMock = jest.fn();

const mockVendor: Vendor = {
  id: "mock-id",
  name: "mock-name",
  email: "mock-email@provider.com",
  contactNumber: "mock-number",
};

const TestVendorProfileFormComponent = () => {
  const TestVendorProfileFormStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <VendorContext.Provider
        value={{ vendor: mockVendor, setVendor: setVendorMock }}
      >
        <TestVendorProfileFormStack.Navigator initialRouteName="VendorProfileForm">
          <TestVendorProfileFormStack.Screen
            name="VendorProfileForm"
            component={VendorProfileForm}
          />
          <TestVendorProfileFormStack.Screen
            name="VendorHome"
            component={VendorHome}
          />
          <TestVendorProfileFormStack.Screen
            name="SuccessError"
            component={SuccessError}
          />
        </TestVendorProfileFormStack.Navigator>
      </VendorContext.Provider>
    </NavigationContainer>
  );
};

let user: UserEventInstance;
const mockGetToken = jest.fn();
const mockUserId = "mock-user-id";
const token = "jwttoken";

beforeEach(() => {
  jest.useFakeTimers();
  user = userEvent.setup();

  (useAuth as jest.Mock).mockReturnValue({
    userId: mockUserId,
    getToken: mockGetToken.mockReturnValue(token),
  });

  (useUser as jest.Mock).mockReturnValue({
    user: {
      primaryEmailAddress: {
        emailAddress: mockVendor.email,
        toString: () => mockVendor.email,
      },
    },
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("VendorForm", () => {
  it("Should display inputs for vendor logo, name, email, contact number, and address", async () => {
    await waitFor(() => {
      render(<TestVendorProfileFormComponent />);
    });

    const logoUploadImage = screen.getByTestId("test-profile-upload-image");
    const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");
    const nameInput = screen.getByPlaceholderText("Name");
    const emailInput = screen.getByTestId("test-email-text-input");
    const currentEmailButton = screen.getByTestId("test-current-email-button");
    const contactNumberInput = screen.getByPlaceholderText("Contact No.");

    await waitFor(async () => {
      expect(logoUploadImage).toBeOnTheScreen();
      expect(logoUploadBtn).toBeOnTheScreen();
      expect(nameInput).toBeOnTheScreen();
      expect(emailInput).toBeOnTheScreen();
      expect(currentEmailButton).toBeOnTheScreen();
      expect(contactNumberInput).toBeOnTheScreen();
    });
  });

  const imageFormats = [
    {
      extension: "gif",
      mimeType: "image/gif",
    },
    {
      extension: "bmp",
      mimeType: "image/bmp",
    },
    {
      extension: "tiff",
      mimeType: "image/tiff",
    },
    {
      extension: "tif",
      mimeType: "image/tiff",
    },
    {
      extension: "webp",
      mimeType: "image/webp",
    },
    {
      extension: "svg",
      mimeType: "image/svg+xml",
    },
    {
      extension: "heif",
      mimeType: "image/heif",
    },
    {
      extension: "heic",
      mimeType: "image/heic",
    },
    {
      extension: "ico",
      mimeType: "image/x-icon",
    },
    {
      extension: "avif",
      mimeType: "image/avif",
    },
  ];

  describe("Logo Upload Field", () => {
    it("should display the image uploaded by the user", async () => {
      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpg`,
            mimeType: `image/jpeg`,
          },
        ],
      });
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      await user.press(logoUploadBtn);

      const logoUploadImage = screen.getByTestId("test-profile-upload-image");

      await waitFor(() => {
        expect(launchImageLibraryAsync).toHaveBeenCalled();
        expect(getInfoAsync).toHaveBeenCalledWith(mockUri, { size: true });
        expect(logoUploadImage.props.source.uri).toBe(mockUri);
      });
    });

    it("should display an alert when user denies media permissions", async () => {
      useMediaLibraryPermissions.mockReturnValue([
        {
          granted: false,
        },
        jest.fn().mockResolvedValue({ granted: false }),
      ]);

      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpg`,
            mimeType: `image/jpeg`,
          },
        ],
      });

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      await user.press(logoUploadBtn);

      expect(alert).toHaveBeenCalled();
    });

    it("should display a loading indicator while selecting an image to upload", async () => {
      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                canceled: false,
                assets: [
                  {
                    uri: mockUri,
                    fileName: `mocked-image.jpg`,
                    mimeType: `image/jpeg`,
                  },
                ],
              });
            }, 2000);
          }),
      );

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");
      const logoUploadImage = screen.getByTestId("test-profile-upload-image");

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeNull();

      await user.press(logoUploadBtn);

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeTruthy();

      jest.runAllTimers();

      await waitFor(() => {
        expect(logoUploadImage.props.source.uri).toBe(mockUri);
      });

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeNull();
    });

    it("should display a default image in the avatar field if user did not upload an image", async () => {
      const defaultImage = require("../../../../assets/images/user.png");
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadImage = screen.getByTestId("test-profile-upload-image");

      await waitFor(() => {
        expect(logoUploadImage.props.source).toBe(defaultImage);
      });
    });

    it("should display an error message if the uploaded image exceeds 5mb", async () => {
      const mockUri = faker.image.dataUri();
      const size = faker.number.int({ min: 5242880 });

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpg`,
            mimeType: `image/jpeg`,
          },
        ],
      });

      getInfoAsync.mockResolvedValue({
        size,
      });
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      expect(
        screen.getByTestId("test-profile-avatar-err-text").children[0],
      ).toBeFalsy();

      await user.press(logoUploadBtn);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should accept images of the JPEG format and its jpg extension", async () => {
      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpg`,
            mimeType: `image/jpeg`,
          },
        ],
      });

      getInfoAsync.mockResolvedValue({
        size: faker.number.int({ max: 5242879 }),
      });

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      await user.press(logoUploadBtn);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeFalsy();
      });
    });

    it("should accept images of the JPEG format and its jpegg extension", async () => {
      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpeg`,
            mimeType: `image/jpeg`,
          },
        ],
      });

      getInfoAsync.mockResolvedValue({
        size: faker.number.int({ max: 5242879 }),
      });

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      await user.press(logoUploadBtn);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeFalsy();
      });
    });

    it("should accept images of the PNG format", async () => {
      const mockUri = faker.image.dataUri();

      launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.png`,
            mimeType: `image/png`,
          },
        ],
      });

      getInfoAsync.mockResolvedValue({
        size: faker.number.int({ max: 5242879 }),
      });

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

      await user.press(logoUploadBtn);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeFalsy();
      });
    });

    it.each(imageFormats)(
      "should not accept any images other than png/jpeg. format used: $mimeType",
      async ({ mimeType, extension }) => {
        const mockUri = faker.image.dataUri();

        launchImageLibraryAsync.mockResolvedValue({
          canceled: false,
          assets: [
            {
              uri: mockUri,
              fileName: extension,
              mimeType,
            },
          ],
        });

        getInfoAsync.mockResolvedValue({
          size: faker.number.int({ max: 5242879 }),
        });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeFalsy();

        const logoUploadBtn = screen.getByTestId("test-profile-upload-btn");

        await user.press(logoUploadBtn);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        await user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-profile-avatar-err-text").children[0],
          ).toBeTruthy();
        });
      },
    );
  });

  describe("Name text field", () => {
    const validTestNames = Array.from(Array(10), () => faker.company.name());

    it.each(validTestNames)(
      "Should accept %s inputs from the user",
      async (name) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const vendorNameInput = screen.getByPlaceholderText("Name");

        user.type(vendorNameInput, name);

        const vendorNameErrorTxt = screen.queryByTestId("test-name-err-text");

        await waitFor(() => {
          expect(vendorNameInput.props.value).toBe(name);
          expect(vendorNameErrorTxt).toBeNull();
        });
      },
    );

    it.each(validTestNames)(
      "Should accept %s inputs from the user",
      async (name) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const vendorNameInput = screen.getByPlaceholderText("Name");

        user.type(vendorNameInput, name);

        const vendorNameErrorTxt = screen.queryByTestId("test-name-err-text");

        await waitFor(() => {
          expect(vendorNameInput.props.value).toBe(name);
          expect(vendorNameErrorTxt).toBeNull();
        });
      },
    );

    it("Should display an error text, if name field is left empty", async () => {
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const vendorNameInput = screen.getByPlaceholderText("Name");
      const vendorContactNumberInput =
        screen.getByPlaceholderText("Contact No.");

      user.type(vendorNameInput, "");

      user.press(vendorContactNumberInput);

      await waitFor(() => {
        expect(screen.queryByTestId("test-name-err-text")).not.toBeNull();
        expect(screen.queryByTestId("test-name-err-text")).toBeVisible();
      });
    });
  });

  describe("Email input field", () => {
    const validTestEmails = Array.from(Array(10), () => faker.internet.email());

    it.each(validTestEmails)(
      "should accept %s as valid input for email",
      async (email) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        await user.press(screen.getByTestId("test-new-email-btn"));

        const vendorNewEmailInput = screen.getByTestId("test-email-text-input");

        user.clear(vendorNewEmailInput);

        user.type(vendorNewEmailInput, email);

        const vendorEmailErrorTxt = screen.queryByTestId("test-email-err-text");

        await waitFor(() => {
          console.log(vendorNewEmailInput.props.value);
          expect(vendorNewEmailInput.props.value).toBe(email);
          expect(vendorEmailErrorTxt).toBeNull();
        });
      },
    );

    it("Should provide client email when current email is selected", async () => {
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      await user.press(screen.getByTestId("test-current-email-button"));

      const currentEmailText = screen.getByTestId("test-current-email-text");

      const vendorEmailErrorTxt = screen.queryByTestId("test-email-err-text");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      user.press(nextButton);

      await waitFor(() => {
        expect(currentEmailText).toHaveTextContent(mockVendor.email);
        expect(vendorEmailErrorTxt).toBeNull();
      });
    });

    it("Should display an error text, if new email is selected and is left empty", async () => {
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      await user.press(screen.getByTestId("test-new-email-btn"));

      const vendorNewEmailInput = screen.getByTestId("test-email-text-input");

      user.clear(vendorNewEmailInput);

      user.type(vendorNewEmailInput, "");

      const vendorContactNumberInput =
        screen.getByPlaceholderText("Contact No.");

      user.press(vendorContactNumberInput);

      await waitFor(() => {
        expect(screen.queryByTestId("test-email-err-text")).not.toBeNull();
        expect(screen.queryByTestId("test-email-err-text")).toBeVisible();
      });
    });

    const invalidTestEmails = [
      "plainaddress", // Missing '@' and domain
      "@missingusername.com", // Missing username
      "username@.com", // Missing domain name
      "username@com", // Missing top-level domain
      "username@com.", // Top-level domain is empty
      "username@domain..com", // Double dot in domain
      "username@domain.com.", // Trailing dot in domain
      "username@domain.c", // Top-level domain is too short
      "user name@domain.com", // Space in the local part
      "username@domain..com", // Consecutive dots in the domain part
      "username@-domain.com", // Leading hyphen in the domain
      "username@domain-.com", // Trailing hyphen in the domain
      ".username@domain.com", // Leading dot in the local part
      "username@domain.com ", // Trailing space
      " username@domain.com", // Leading space
      "username@domain,com", // Comma instead of dot in the domain
      "username@domain@domain.com", // Double '@'
      "username@domain..", // Incomplete domain
      "username@.domain.com", // Leading dot in the domain
      "username@domain..com", // Consecutive dots in the domain
    ];

    it.each(invalidTestEmails)(
      "Should display an error text, if user inputs %s",
      async (invalidEmail) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        await user.press(screen.getByTestId("test-new-email-btn"));

        const vendorNewEmailInput = screen.getByTestId("test-email-text-input");

        await user.type(vendorNewEmailInput, invalidEmail);

        const vendorContactNumberInput =
          screen.getByPlaceholderText("Contact No.");

        user.press(vendorContactNumberInput);

        await waitFor(() => {
          expect(screen.queryByTestId("test-email-err-text")).not.toBeNull();
          expect(screen.queryByTestId("test-email-err-text")).toBeVisible();
        });
      },
    );
  });

  describe("Contact No. Field", () => {
    const validContactNumbers = Array.from(
      Array(10),
      () => `09${faker.string.numeric(9)}`,
    );

    it.each(validContactNumbers)(
      "should allow user to enter %s as their contact number",
      async (contactNumber) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const contactNumberErrorTxt = screen.queryByTestId(
          "test-contact-number-err-text",
        );

        await waitFor(() => {
          expect(contactNumberInput.props.value).toBe(contactNumber);
          expect(contactNumberErrorTxt).toBeNull();
        });
      },
    );

    const invalidPhoneNumbers = [
      "09a12345678",
      "0912345678",
      "091234567890",
      "09@123456789",
      "639123456789",
    ];

    it("should display an error if the user has provided an invalid number", async () => {
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length - 1 })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, randomPhoneNumber);

      const vendorNameInput = screen.getByPlaceholderText("Name");

      await user.type(vendorNameInput, "");

      const contactNumberErrorTxt = screen.queryByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt).not.toBeNull();
      });
    });

    it("should display an error if the user did not provide a phone number", async () => {
      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, "");

      const vendorNameInput = screen.getByPlaceholderText("Name");

      await user.type(vendorNameInput, "");

      const contactNumberErrorTxt = screen.queryByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt).not.toBeNull();
      });
    });
  });

  describe("Form Confirmation Screen", () => {
    const validFormTestData = Array.from(Array(10), () => {
      return {
        name: faker.company.name(),
        email: faker.internet.email(),
        contactNumber: `09${faker.string.numeric(9)}`,
      };
    });

    it.each(validFormTestData)(
      "should display the user inputted values and the uploaded image after pressing the next button, values: ($name, $email, $contactNumber,) ",
      async ({ name, email, contactNumber }) => {
        const mockUri = faker.image.dataUri();

        launchImageLibraryAsync.mockResolvedValue({
          canceled: false,
          assets: [
            {
              uri: mockUri,
              fileName: `mocked-image.jpg`,
              mimeType: `image/jpeg`,
            },
          ],
        });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        await user.press(screen.getByTestId("test-new-email-btn"));

        await user.clear(screen.getByTestId("test-email-text-input"));

        await user.type(screen.getByTestId("test-email-text-input"), email);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        user.press(screen.getByRole("button", { name: "NEXT" }));

        await waitFor(() => {
          expect(screen.getByText(name)).toBeOnTheScreen();
          expect(screen.getByText(email)).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
          expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
            mockUri,
          );
        });
      },
    );

    it.each(validFormTestData)(
      "should display the user inputted values, client email and the uploaded image after pressing the next button, values: ($name, $contactNumber)  ",
      async ({ name, contactNumber }) => {
        const mockUri = faker.image.dataUri();

        launchImageLibraryAsync.mockResolvedValue({
          canceled: false,
          assets: [
            {
              uri: mockUri,
              fileName: `mocked-image.jpg`,
              mimeType: `image/jpeg`,
            },
          ],
        });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        await user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByText(name)).toBeOnTheScreen();
          expect(screen.getByText(mockVendor.email)).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
          expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
            mockUri,
          );
        });
      },
    );

    it.each(validFormTestData)(
      "should display the user inputted values after pressing the next button, values: ($name $email, $contactNumber)  ",
      async ({ name, email, contactNumber }) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });
        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        await user.press(screen.getByTestId("test-new-email-btn"));

        const vendorNewEmailInput = screen.getByTestId("test-email-text-input");

        user.clear(vendorNewEmailInput);

        await user.type(vendorNewEmailInput, email);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        await user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByText(name)).toBeOnTheScreen();
          expect(screen.getByText(email)).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should display the user inputted values and client current email after pressing the next button, values: ($name $email, $contactNumber) ",
      async ({ name, contactNumber }) => {
        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        await user.press(screen.getByTestId("test-new-email-btn"));

        await user.press(screen.getByTestId("test-current-email-button"));

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByText(name)).toBeOnTheScreen();
          expect(screen.getByText(mockVendor.email)).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
        });
      },
    );
  });

  describe("On Pressing the Submit Button", () => {
    const validFormTestData = Array.from(Array(10), () => {
      return {
        name: faker.company.name(),
        email: faker.internet.email(),
        contactNumber: `09${faker.string.numeric(9)}`,
      };
    });

    let firebase: FirebaseService;
    const mockRef = "mock-firebase-ref";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    beforeEach(() => {
      firebase = FirebaseService.getInstance();

      jest.spyOn(firebase, "uploadProfileAvatar").mockImplementation(() => {
        return Promise.resolve({
          ref: mockRef,
          metadata: { fullPath: mockRef },
        } as unknown as UploadResult);
      });
    });

    afterEach(() => {
      fetch.resetMocks();
      jest.restoreAllMocks();
    });

    it("should send the uploaded image to firebase storage", async () => {
      const mockUri = faker.image.dataUri();
      const size = faker.number.int({ max: 5242879 });
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

      fetch.once(url, { status: 201, headers });

      const mockedImagePickerResult = {
        canceled: false,
        assets: [
          {
            uri: mockUri,
            fileName: `mocked-image.jpg`,
            mimeType: `image/jpeg`,
          },
        ],
      };

      launchImageLibraryAsync.mockResolvedValue(mockedImagePickerResult);

      getInfoAsync.mockResolvedValue({
        size,
      });

      await waitFor(() => {
        render(<TestVendorProfileFormComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      expect(
        screen.getByTestId("test-profile-avatar-err-text").children[0],
      ).toBeFalsy();

      await user.press(profileAvatarUploadBtn);

      const vendorNameInput = screen.getByPlaceholderText("Name");

      await user.type(vendorNameInput, faker.company.name());

      await user.press(screen.getByTestId("test-new-email-btn"));

      await user.clear(screen.getByTestId("test-email-text-input"));

      await user.type(
        screen.getByTestId("test-email-text-input"),
        faker.internet.email(),
      );

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, `09${faker.string.numeric(9)}`);

      const nextButton = screen.getByRole("button", { name: "NEXT" });
      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-vendor-profile-form-confirm"),
        ).toBeOnTheScreen();
      });

      await user.press(screen.getByRole("button", { name: "SAVE" }));

      const expectedImageInfo: ImageInfo = {
        uri: mockUri,
        fileSize: size,
        mimeType: mockedImagePickerResult.assets[0].mimeType,
        fileExtension: "jpg",
      };

      await waitFor(() => {
        expect(firebase.uploadProfileAvatar).toHaveBeenCalledWith(
          mockUserId,
          expectedImageInfo,
        );
      });
    });

    it.each(validFormTestData)(
      "should send the user information with avatar to the backend service, values: ($name $email, $contactNumber)",
      async (data) => {
        const { name, email, contactNumber } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;
        const mockVendorId = "mock-vendor-id"

        fetch.once(JSON.stringify({_id: mockVendorId}),{ status: 201, headers, url: url });

        const mockUri = faker.image.dataUri();
        const size = faker.number.int({ max: 5242879 });

        const mockedImagePickerResult = {
          canceled: false,
          assets: [
            {
              uri: mockUri,
              fileName: `mocked-image.jpg`,
              mimeType: `image/jpeg`,
            },
          ],
        };

        launchImageLibraryAsync.mockResolvedValue(mockedImagePickerResult);

        getInfoAsync.mockResolvedValue({
          size,
        });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        await user.press(screen.getByTestId("test-new-email-btn"));

        await user.clear(screen.getByTestId("test-email-text-input"));

        await user.type(screen.getByTestId("test-email-text-input"), email);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-vendor-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const vendor = {
          logo: mockRef,
          name,
          email,
          contactNumber,
        };

        const expectedVendor = {
          id: mockVendorId,
          ...vendor
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...vendor,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          console.log(setVendorMock.mock.calls)
          expect(setVendorMock).toHaveBeenCalledWith(expectedVendor);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should send the user information with avatar and current email to the backend service, values: ($name $contactNumber)",
      async (data) => {
        const { name, email, contactNumber } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;
        const mockVendorId = "mock-vendor-id"

        fetch.once(JSON.stringify({_id: mockVendorId}),{ status: 201, headers, url: url });

        const mockUri = faker.image.dataUri();
        const size = faker.number.int({ max: 5242879 });

        const mockedImagePickerResult = {
          canceled: false,
          assets: [
            {
              uri: mockUri,
              fileName: `mocked-image.jpg`,
              mimeType: `image/jpeg`,
            },
          ],
        };

        launchImageLibraryAsync.mockResolvedValue(mockedImagePickerResult);

        getInfoAsync.mockResolvedValue({
          size,
        });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-vendor-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const vendor = {
          logo: mockRef,
          name,
          email: mockVendor.email,
          contactNumber,
        };

        const expectedVendor = {
          id: mockVendorId,
          ...vendor
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...vendor,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          console.log(setVendorMock.mock.calls)
          expect(setVendorMock).toHaveBeenCalledWith(expectedVendor);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should send the user information without avatar to the backend service, values: ($name $email, $contactNumber)",
      async (data) => {
        const { name, email, contactNumber } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;
        const mockVendorId = "mock-vendor-id"

        fetch.once(JSON.stringify({_id: mockVendorId}),{ status: 201, headers, url: url });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        await user.press(screen.getByTestId("test-new-email-btn"));

        await user.clear(screen.getByTestId("test-email-text-input"));

        await user.type(screen.getByTestId("test-email-text-input"), email);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-vendor-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const vendor = {
          name,
          email,
          contactNumber,
        };

        const expectedVendor = {
          id: mockVendorId,
          ...vendor
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...vendor,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          expect(setVendorMock).toHaveBeenCalledWith(expectedVendor);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should send the user information using his current email as vendor email and without avatar to the backend service, values: ($name $contactNumber)",
      async (data) => {
        const { name,  contactNumber } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/vendors`;
        const mockVendorId = "mock-vendor-id"

        fetch.once(JSON.stringify({_id: mockVendorId}),{ status: 201, headers, url: url });

        await waitFor(() => {
          render(<TestVendorProfileFormComponent />);
        });

        const vendorNameInput = screen.getByPlaceholderText("Name");

        await user.type(vendorNameInput, name);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const nextButton = screen.getByRole("button", { name: "NEXT" });

        user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-vendor-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const vendor = {
          name,
          email: mockVendor.email,
          contactNumber,
        };

        const expectedVendor = {
          id: mockVendorId,
          ...vendor
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...vendor,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          expect(setVendorMock).toHaveBeenCalledWith(expectedVendor);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );


  });
});
