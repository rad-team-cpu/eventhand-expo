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
import { UploadResult } from "firebase/storage";
import fetch from "jest-fetch-mock";
import { BackHandler, GestureResponderEvent } from "react-native";

import { getInfoAsync } from "../../../../test/__mocks__/expo-file-system";
import {
  launchImageLibraryAsync,
  useMediaLibraryPermissions,
} from "../../../../test/__mocks__/expo-image-picker";
import { UserContext } from "../../../Contexts/UserContext";
import FirebaseService from "../../../firebase";
import { ImageInfo, ScreenProps, UserProfile } from "../../../types/types";
import Home from "../../Home";
import SuccessError from "../../SuccessError";
import ProfileForm from "../Form";


const mockUser: UserProfile = {
  email: "emailadress@example.com",
  lastName: "Doe",
  firstName: "John",
  contactNumber: "1234567890",
  gender: "male",
  events: [],
  chats: [],
  vendorId: "vendor123",
};

const setUserMock = jest.fn();

const TestProfileComponent = () => {
  const TestProfileStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <UserContext.Provider value={{ user: mockUser, setUser: setUserMock }}>
        <TestProfileStack.Navigator>
          <TestProfileStack.Screen name="ProfileForm" component={ProfileForm} />
          <TestProfileStack.Screen name="Home" component={Home} />
          <TestProfileStack.Screen
            name="SuccessError"
            component={SuccessError}
          />
        </TestProfileStack.Navigator>
      </UserContext.Provider>
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
    user:{
      primaryEmailAddress:{
        emailAddress: mockUser.email
      }
    }
  })
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("ProfileForm", () => {
  it("should display a field for last name, first name, contact number, gender buttons, birth date selection, and a submit button", async () => {
    waitFor(() => {
      render(<TestProfileComponent />);
    });

    const profileScreen = screen.getByTestId("test-profile-form-field");
    const profileAvatarUploadImage = screen.getByTestId(
      "test-profile-upload-image",
    );
    const profileAvatarUploadBtn = screen.getByTestId(
      "test-profile-upload-btn",
    );
    const firstNameInput = screen.getByPlaceholderText("First Name");
    const lastNameInput = screen.getByPlaceholderText("Last Name");
    const contactNumberInput = screen.getByPlaceholderText("Contact No.");
    const maleButton = screen.getByText("Male");
    const femaleButton = screen.getByText("Female");
    const nextButton = screen.getByRole("button", { name: "NEXT" });

    await waitFor(() => {
      expect(profileScreen).toBeOnTheScreen();
      expect(profileAvatarUploadBtn).toBeOnTheScreen();
      expect(profileAvatarUploadImage).toBeOnTheScreen();
      expect(firstNameInput).toBeOnTheScreen();
      expect(lastNameInput).toBeOnTheScreen();
      expect(contactNumberInput).toBeOnTheScreen();
      expect(maleButton).toBeOnTheScreen();
      expect(femaleButton).toBeOnTheScreen();
      expect(nextButton).toBeOnTheScreen();
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

  describe("Profile Upload Field", () => {
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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      await user.press(profileAvatarUploadBtn);

      const profileAvatarUploadImage = screen.getByTestId(
        "test-profile-upload-image",
      );

      await waitFor(() => {
        expect(launchImageLibraryAsync).toHaveBeenCalled();
        expect(getInfoAsync).toHaveBeenCalledWith(mockUri, { size: true });
        expect(profileAvatarUploadImage.props.source.uri).toBe(mockUri);
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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      await user.press(profileAvatarUploadBtn);

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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );
      const profileAvatarUploadImage = screen.getByTestId(
        "test-profile-upload-image",
      );

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeNull();

      await user.press(profileAvatarUploadBtn);

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeTruthy();

      jest.runAllTimers();

      await waitFor(() => {
        expect(profileAvatarUploadImage.props.source.uri).toBe(mockUri);
      });

      expect(screen.queryByTestId("test-loading-upload-btn")).toBeNull();
    });

    it("should display a default image in the avatar field if user did not upload an image", async () => {
      const defaultImage = require("../../../assets/images/user.png");
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadImage = screen.getByTestId(
        "test-profile-upload-image",
      );

      await waitFor(() => {
        expect(profileAvatarUploadImage.props.source).toBe(defaultImage);
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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      expect(
        screen.getByTestId("test-profile-avatar-err-text").children[0],
      ).toBeFalsy();

      await user.press(profileAvatarUploadBtn);

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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      await user.press(profileAvatarUploadBtn);

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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      await user.press(profileAvatarUploadBtn);

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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      await user.press(profileAvatarUploadBtn);

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
          render(<TestProfileComponent />);
        });

        expect(
          screen.getByTestId("test-profile-avatar-err-text").children[0],
        ).toBeFalsy();

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

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

  const namesWithNumbersAndSymbols = [
    "@Alice1!",
    "Bo3b",
    "C1ar*ol",
    "D4a7vid",
    "Eve*5",
    "Fr^nk6",
    "G!ace",
    "Ha?nk8",
    "Irene9",
    "J2ck10",
    "11",
    "L12@",
    "M13ike",
    "N&ncy14",
    "O15",
    "#Pat16",
    "17!",
    "Q%ncy",
    "R;ick",
    "S<usan",
    "T>om",
    "U?rsula",
    "V.emma",
    "W[ill",
    "X]enia",
    'Y"ank',
    "Z*oe",
    "1Alice",
    "Bob2",
    "C3arol",
    "D4avid",
    "Eve5",
    "Frank6",
    "7Grace",
    "Hank8",
    "Irene9",
    "Jack10",
    "11Karen",
    "L12arry",
    "M13ike",
    "Nancy14",
    "O15liver",
    "Pat16",
    "17Quincy",
    "R18achel",
    "Sam19",
    "T20om",
    "21Ursula",
    "V22ictor",
    "Wendy23",
    "24Xander",
    "Y25asmine",
    "Zach26",
    "Anna@",
    "B#en",
    "Ch$ris",
    "D*an",
    "El&ena",
    "F%rank",
    "G^ary",
    "H!anna",
    "I(sa",
    "J)ack",
    "K+ate",
    "L~iam",
    "M`ike",
    "N@ncy",
    "O}scar",
    "P|aul",
    "Q:ueen",
    "R;ick",
    "S<usan",
    "T>om",
    "U?rsula",
    "V.emma",
    "W[ill",
    "X]enia",
    'Y"ank',
    "Z*oe",
  ];

  const validFormTestData = [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
  ];

  describe("First name field", () => {
    it.each(validFormTestData)(
      "should allow user to enter $firstName as their first name",
      async ({ firstName }) => {
        await waitFor(() => {
          render(<TestProfileComponent />);
        });
        const firstNameInput = screen.getByPlaceholderText("First Name");
        const firstNameErrorTxt = screen.getByTestId(
          "test-first-name-err-text",
        );

        await user.type(firstNameInput, firstName);

        await waitFor(() => {
          expect(firstNameInput.props.value).toBe(firstName);
          expect(firstNameErrorTxt.children[0]).toBeFalsy();
        });
      },
    );

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and - when shifting focus away to the last name field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and - when shifting focus away to the contact no. field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      user.type(contactNumberInput, validFormTestData[0].contactNumber);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the male button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the female button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if user has inputted non-digit characters and symbols excluding ` and -  when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, randomName);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("profile-form-confirm")).toBeNull();
      });
    });

    it("should display an error text if the user did not input his/her first name when shifting focus away to the last name field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });
      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her first name when shifting focus away to the contact no. field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      user.type(contactNumberInput, validFormTestData[0].contactNumber);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her first name when pressing the male button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her first name when pressing the female button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her first name when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if the user did not input his/her first name when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-first-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(firstNameInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("test-profile-form-confirm")).toBeNull();
      });
    });
  });

  describe("Last Name Field", () => {
    it.each(validFormTestData)(
      "should allow user to enter $lastName as their last name",
      async ({ lastName }) => {
        await waitFor(() => {
          render(<TestProfileComponent />);
        });
        const lastNameInput = screen.getByPlaceholderText("Last Name");
        const lastNameErrorTxt = screen.getByTestId("test-last-name-err-text");

        await user.type(lastNameInput, lastName);

        await waitFor(() => {
          expect(lastNameInput.props.value).toBe(lastName);
          expect(lastNameErrorTxt.children[0]).toBeFalsy();
        });
      },
    );

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and - when shifting focus away to the first name field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });
      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and - when shifting focus away to the contact no. field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      user.type(contactNumberInput, validFormTestData[0].contactNumber);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the male button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the female button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if user has inputted non-digit characters and symbols excluding ` and -  when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if user has inputted non-digit characters and symbols excluding ` and -  when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomName =
        namesWithNumbersAndSymbols[
          faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
        ];

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, randomName);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("profile-form-confirm")).toBeNull();
      });
    });

    it("should display an error text if the user did not input his/her last name when shifting focus away to the first name field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her last name shifting focus away to the contact no. field", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      user.type(contactNumberInput, validFormTestData[0].contactNumber);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her last name when pressing the male button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her last name pressing the female button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should display an error text if the user did not input his/her last name when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if the user did not input his/her last name when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });
      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-last-name-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(lastNameInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("test-profile-form-confirm")).toBeNull();
      });
    });
  });

  const invalidPhoneNumbers = [
    "09a12345678",
    "0912345678",
    "091234567890",
    "09@123456789",
    "639123456789",
  ];

  describe("Contact No. Field", () => {
    it.each(validFormTestData)(
      "should allow user to enter $contactNumber as their contact number",
      async ({ contactNumber }) => {
        await waitFor(() => {
          render(<TestProfileComponent />);
        });

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const contactNumberErrorTxt = screen.getByTestId(
          "test-contact-number-err-text",
        );

        await waitFor(() => {
          expect(contactNumberInput.props.value).toBe(contactNumber);
          expect(contactNumberErrorTxt.children[0]).toBeFalsy();
        });
      },
    );

    it("should display an error if the user given phone number provided, has non-digit characters when shifting focus away to the first name field ", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length - 1 })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user given phone number provided, has non-digit characters when shifting focus away to the last name field ", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user given phone number provided, has non-digit characters when pressing the Male gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user given phone number provided, has non-digit characters when pressing the Female gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error text if the user given phone number provide, has non-digit characters when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if the user given phone number provided has non-digit characters when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const randomPhoneNumber =
        invalidPhoneNumbers[
          faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
        ];

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, randomPhoneNumber);

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("profile-form-confirm")).toBeNull();
      });
    });

    it("should display an error if the user did not provide his/her phone number when shifting focus away to the first name field", async () => {
      await waitFor(() => {
        render(
          <TestProfileComponent/>
        );
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user did not provide his/her phone number when shifting focus away to the last name field ", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });
      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user did not provide his/her phone number when pressing the Male gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const maleButton = screen.getByText("Male");

      await user.press(maleButton);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error if the user given phone number provided has non-digit characters when pressing the Female gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const femaleButton = screen.getByText("Female");

      await user.press(femaleButton);

      const contactNumberErrorTxt = screen.getByTestId(
        "test-contact-number-err-text",
      );

      await waitFor(() => {
        expect(contactNumberErrorTxt.children[0]).toBeTruthy();
      });
    });

    it("should display an error text if the user did not provide his/her phone number when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should not proceed to the confirmation screen if the user did not provide his/her phone number when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await waitFor(() => {
        expect(
          screen.getByTestId("test-contact-number-err-text").children[0],
        ).toBeFalsy();
      });

      await user.type(contactNumberInput, "");

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("test-profile-form-confirm")).toBeNull();
      });
    });
  });

  describe("Gender Buttons", () => {
    it("should highlight the male button, if the user pressed the male gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-male-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      await user.press(screen.getByText("Male"));

      await waitFor(() => {
        expect(screen.getByTestId("test-male-btn")).toHaveStyle({
          backgroundColor: "#1ecbe1",
        });
      });
    });

    it("should highlight the female button, if the user pressed the female gender button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-female-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      await user.press(screen.getByText("Female"));

      await waitFor(() => {
        expect(screen.getByTestId("test-female-btn")).toHaveStyle({
          backgroundColor: "#f30cc8",
        });
      });
    });

    it("should display an error text if user did not choose a gender when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-gender-err-text").children[0],
        ).toBeFalsy();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-female-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-male-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-gender-err-text").children[0],
        ).toBeTruthy();
      });
    });

    it("should should not proceed to the confirmation screen if user did not choose a gender when pressing the next button", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-gender-err-text").children[0],
        ).toBeFalsy();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-female-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId("test-male-btn").props.style.backgroundColor,
        ).toBeFalsy();
      });

      const nextButton = screen.getByRole("button", { name: "NEXT" });

      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.queryByTestId("test-profile-form-confirm")).toBeNull();
      });
    });
  });

  describe("On pressing the next button", () => {
    it.each(validFormTestData)(
      "should proceed to the confirmation screen when the user inputs the name $firstName $lastName, the contact number $contactNumber, presses the $gender button and has uploaded an avatar",
      async ({ firstName, lastName, contactNumber, gender }) => {
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
          render(<TestProfileComponent />);
        });
        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-profile-form-confirm"),
          ).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should proceed to the confirmation screen when the user inputs the name $firstName $lastName, the contact number $contactNumber, presses the $gender button and without uploading an avatar",
      async ({ firstName, lastName, contactNumber, gender }) => {
        await waitFor(() => {
          render(<TestProfileComponent />);
        });
        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-profile-form-confirm"),
          ).toBeOnTheScreen();
        });
      },
    );
  });

  describe("Form Confirmation Screen", () => {
    it.each(validFormTestData)(
      "should display the user inputted values and the uploaded image after pressing the next button, values: ($firstName $lastName, $contactNumber, $gender) ",
      async ({ firstName, lastName, contactNumber, gender }) => {
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
          render(<TestProfileComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByText(firstName)).toBeOnTheScreen();
          expect(screen.getByText(lastName)).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
          expect(
            screen.getByText(gender.toLocaleUpperCase()),
          ).toBeOnTheScreen();
          expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
            mockUri,
          );
        });
      },
    );

    it.each(validFormTestData)(
      "should display the user inputted values after pressing the next button, values: ($firstName $lastName, $contactNumber, $gender) ",
      async ({ firstName, lastName, contactNumber, gender }) => {
        await waitFor(() => {
          render(<TestProfileComponent />);
        });
        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByTestId("test-first-name")).toBeOnTheScreen();
          expect(screen.getByTestId("test-last-name")).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
          expect(
            screen.getByText(gender.toLocaleUpperCase()),
          ).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should display the user inputted values and the uploaded image after pressing the next button, values: ($firstName $lastName, $contactNumber, $gender) ",
      async ({ firstName, lastName, contactNumber, gender }) => {
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
          render(<TestProfileComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(screen.getByTestId("test-first-name")).toBeOnTheScreen();
          expect(screen.getByTestId("test-last-name")).toBeOnTheScreen();
          expect(screen.getByText(contactNumber)).toBeOnTheScreen();
          expect(
            screen.getByText(gender.toLocaleUpperCase()),
          ).toBeOnTheScreen();
          expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
            mockUri,
          );
        });
      },
    );

    it("should display the a save button to submit the data", async () => {
      await waitFor(() => {
        render(<TestProfileComponent />);
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, validFormTestData[0].contactNumber);

      const maleButton = screen.getByText("Male");
      const femaleButton = screen.getByText("Female");

      await user.press(
        validFormTestData[0].gender === "male" ? maleButton : femaleButton,
      );

      const nextButton = screen.getByRole("button", { name: "NEXT" });
      await user.press(nextButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "SAVE" })).toBeOnTheScreen();
      });
    });

    // it.only("should return to the profile field state when phone back button is pressed", async () => {
    //   await waitFor(() => {
    //     render(<TestProfileComponent/>);
    //   });

    //   const firstNameInput = screen.getByPlaceholderText("First Name");

    //   await user.type(firstNameInput, validFormTestData[0].firstName);

    //   const lastNameInput = screen.getByPlaceholderText("Last Name");

    //   await user.type(lastNameInput, validFormTestData[0].lastName);

    //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

    //   await user.type(contactNumberInput, validFormTestData[0].contactNumber);

    //   const maleButton = screen.getByText("Male");
    //   const femaleButton = screen.getByText("Female");

    //   await user.press(
    //     validFormTestData[0].gender === "male" ? maleButton : femaleButton,
    //   );

    //   const nextButton = screen.getByRole("button", { name: "NEXT" });
    //   await user.press(nextButton);

    //   await waitFor(() => {
    //     expect(
    //       screen.getByTestId("test-profile-form-confirm"),
    //     ).toBeOnTheScreen();
    //   });

    //   const backAction: jest.Mock =  (BackHandler.addEventListener as jest.Mock).mock
    //     .calls[0][1];

    //   // await waitFor(() => backAction())

    //   await waitFor(() => {
    //     backAction()
    //     expect(BackHandler.addEventListener).toHaveBeenCalled();
    //   });
    // }, 10000000);
  });

  describe("On Pressing the Submit Button", () => {
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
        render(<TestProfileComponent />);
      });

      const profileAvatarUploadBtn = screen.getByTestId(
        "test-profile-upload-btn",
      );

      expect(
        screen.getByTestId("test-profile-avatar-err-text").children[0],
      ).toBeFalsy();

      await user.press(profileAvatarUploadBtn);

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, validFormTestData[0].firstName);

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, validFormTestData[0].lastName);

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, validFormTestData[0].contactNumber);

      const maleButton = screen.getByText("Male");
      const femaleButton = screen.getByText("Female");

      await user.press(
        validFormTestData[0].gender === "male" ? maleButton : femaleButton,
      );

      const nextButton = screen.getByRole("button", { name: "NEXT" });
      await user.press(nextButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("test-profile-form-confirm"),
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
      "should send the user information with avatar to the backend service, values: ($firstName $lastName, $contactNumber, $gender)",
      async (data) => {
        const { firstName, lastName, contactNumber, gender } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

        fetch.once(url, { status: 201, headers });

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
          render(<TestProfileComponent />);
        });

        const profileAvatarUploadBtn = screen.getByTestId(
          "test-profile-upload-btn",
        );

        await user.press(profileAvatarUploadBtn);

        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const expectedUser = {
          avatar: mockRef,
          email: mockUser.email,
          firstName,
          lastName,
          contactNumber,
          gender: gender.toLocaleUpperCase(),
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...expectedUser,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          expect(setUserMock).toHaveBeenCalledWith(expectedUser);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );

    it.each(validFormTestData)(
      "should send the user information with avatar to the backend service, values: ($firstName $lastName, $contactNumber, $gender)",
      async (data) => {
        const { firstName, lastName, contactNumber, gender } = data;
        const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users`;

        fetch.once(url, { status: 201, headers });

        await waitFor(() => {
          render(<TestProfileComponent />);
        });

        const firstNameInput = screen.getByPlaceholderText("First Name");

        await user.type(firstNameInput, firstName);

        const lastNameInput = screen.getByPlaceholderText("Last Name");

        await user.type(lastNameInput, lastName);

        const contactNumberInput = screen.getByPlaceholderText("Contact No.");

        await user.type(contactNumberInput, contactNumber);

        const maleButton = screen.getByText("Male");
        const femaleButton = screen.getByText("Female");

        await user.press(gender === "male" ? maleButton : femaleButton);

        const nextButton = screen.getByRole("button", { name: "NEXT" });
        await user.press(nextButton);

        await waitFor(() => {
          expect(
            screen.getByTestId("test-profile-form-confirm"),
          ).toBeOnTheScreen();
        });

        const expectedUser = {
          email: mockUser.email,
          firstName,
          lastName,
          contactNumber,
          gender: gender.toLocaleUpperCase(),
        };

        const request = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: mockUserId,
            ...expectedUser,
          }),
        };

        await user.press(screen.getByRole("button", { name: "SAVE" }));

        await waitFor(() => {
          expect(fetch).toHaveBeenCalledWith(url, request);
          expect(setUserMock).toHaveBeenCalledWith(expectedUser);
          expect(screen.getByTestId("test-success-error")).toBeOnTheScreen();
        });
      },
    );
  });
  // it.each(validTestData)(
  //   "Should accept a $gender user with the name $firstName $lastName and his/her $contactNumber, ",
  //   async (data) => {

  //     // const url = "";
  //     // const request = {
  //     //   method: "POST",
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //     Authorization: `Bearer ${mockGetToken()}`,
  //     //   },
  //     //   body: JSON.stringify({ ...data, gender: data.gender.toUpperCase() }),
  //     // };
  //     // const nextButton = screen.getByRole("button", { name: "NEXT" });
  //     let nextButton: ReactTestInstance;

  //     await waitFor(() => {
  //       nextButton = screen.getByRole("button", { name: "NEXT" });

  //       expect(nextButton).toBeDisabled();
  //     });

  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, data.firstName);

  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, data.lastName);

  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     await user.type(contactNumberInput, data.contactNumber);

  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(data.gender === "male" ? maleButton : femaleButton);

  //     // const nextButton = screen.getByRole("button", { name: "NEXT" });
  //     // await user.press(nextButton);

  //     jest.advanceTimersByTime(500);

  //     await waitFor(() => {
  //       nextButton = screen.getByRole("button", { name: "NEXT" });

  //       // expect(mockGetToken).toHaveBeenCalledWith({
  //       //   template: "event-hand-jwt",
  //       // });
  //       // expect(fetch).toHaveBeenCalledWith(url, request);
  //       expect(nextButton).not.toBeDisabled();
  //     });
  //   },
  // );
});
