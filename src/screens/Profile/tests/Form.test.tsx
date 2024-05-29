import { useAuth } from "@clerk/clerk-expo";
import { faker } from "@faker-js/faker";
import RNDateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import {
  screen,
  render,
  waitFor,
  fireEvent,
  userEvent,
  act,
  cleanup,
} from "@testing-library/react-native";
import { UserEventInstance } from "@testing-library/react-native/build/user-event/setup";
import fetch from "jest-fetch-mock";
import * as React from "react";
import { ReactTestInstance } from "react-test-renderer";

import { UserProvider } from "../../../Contexts/UserContext";
import ProfileForm from "../Form";

let mockGetToken: jest.Mock;
let user: UserEventInstance;
const setNewUserId = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  mockGetToken = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    getToken: mockGetToken,
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

describe("ProfileForm", () => {
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
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender: faker.person.sex(),
    },
  ];

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

  const invalidPhoneNumbers = [
    "09123456789",
    "09a12345678",
    "0912345678",
    "091234567890",
    "09@123456789",
    "+639123456789",
  ];

  it("should display a field for last name, first name, contact number, gender buttons, birth date selection, and a submit button", async () => {
    waitFor(() => {
      render(
        <UserProvider>
          <ProfileForm />
        </UserProvider>,
      );
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

  // it.each(validFormTestData)(
  //   "should allow user to enter $firstName as their first name",
  //   async (data) => {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, data.firstName);

  //     const firstNameErrorTxt = screen.getByTestId("test-first-name-err-text");

  //     await waitFor(() => {
  //       expect(firstNameInput.props.value).toBe(data.firstName);
  //       expect(firstNameErrorTxt.children[0]).toBeFalsy();
  //     });
  //   },
  // );

  // it("should warn user that non-digit characters and symbols excluding ` and - are not allowed when shifting focus away from the first name field", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });
  //   const randomName =
  //     namesWithNumbersAndSymbols[
  //       faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
  //     ];

  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, randomName);

  //   if (formField == 0) {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, validFormTestData[0].lastName);
  //   }

  //   if (formField == 1) {
  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     user.type(contactNumberInput, validFormTestData[0].contactNumber);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const firstNameErrorTxt = screen.getByTestId("test-first-name-err-text");

  //   await waitFor(() => {
  //     expect(firstNameErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should disable the next button if the first name field that has digits or symbols or both. ` and - are excluded", async () => {
  //   const randomName =
  //     namesWithNumbersAndSymbols[
  //       faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
  //     ];

  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, randomName);

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

  //   await waitFor(() => {
  //     expect(nextButton).toBeDisabled();
  //   });
  // });

  // it("should warn user that he must provide a first name when shifting focus away from the first name field", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });

  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, "");

  //   if (formField == 0) {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, validFormTestData[0].lastName);
  //   }

  //   if (formField == 1) {
  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     user.type(contactNumberInput, validFormTestData[0].contactNumber);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const firstNameErrorTxt = screen.getByTestId("test-first-name-err-text");

  //   await waitFor(() => {
  //     expect(firstNameErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should disable the next button if the first name field is empty ", async () => {
  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, "");

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

  //   await waitFor(() => {
  //     expect(nextButton).toBeDisabled();
  //   });
  // });

  // it.each(validFormTestData)(
  //   "should allow user to enter $lastName as their last name",
  //   async (data) => {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, data.lastName);

  //     const lastNameErrorTxt = screen.getByTestId("test-last-name-err-text");

  //     await waitFor(() => {
  //       expect(lastNameInput.props.value).toBe(data.lastName);
  //       expect(lastNameErrorTxt.children[0]).toBeFalsy();
  //     });
  //   },
  // );

  // it("should warn user that non-digit characters and symbols excluding ` and - are not allowed when shifting focus away from the last name field", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });
  //   const randomName =
  //     namesWithNumbersAndSymbols[
  //       faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
  //     ];

  //   const lastNameInput = screen.getByPlaceholderText("Last Name");

  //   await user.type(lastNameInput, randomName);

  //   if (formField == 0) {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, validFormTestData[0].firstName);
  //   }

  //   if (formField == 1) {
  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     user.type(contactNumberInput, validFormTestData[0].contactNumber);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const lastNameErrorTxt = screen.getByTestId("test-last-name-err-text");

  //   await waitFor(() => {
  //     expect(lastNameErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should disable the next button if the last name field that has digits or symbols or both. ` and - are excluded", async () => {
  //   const randomName =
  //     namesWithNumbersAndSymbols[
  //       faker.number.int({ min: 0, max: namesWithNumbersAndSymbols.length })
  //     ];

  //   const lastNameInput = screen.getByPlaceholderText("Last Name");

  //   await user.type(lastNameInput, randomName);

  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, validFormTestData[0].firstName);

  //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //   await user.type(contactNumberInput, validFormTestData[0].contactNumber);

  //   const maleButton = screen.getByText("Male");
  //   const femaleButton = screen.getByText("Female");

  //   await user.press(
  //     validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //   );

  //   const nextButton = screen.getByRole("button", { name: "NEXT" });

  //   await waitFor(() => {
  //     expect(nextButton).toBeDisabled();
  //   });
  // });

  // it("should warn user that he must provide a last name when shifting focus away from the last name field", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });

  //   const lastNameInput = screen.getByPlaceholderText("Last Name");

  //   await user.type(lastNameInput, "");

  //   if (formField == 0) {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, validFormTestData[0].firstName);
  //   }

  //   if (formField == 1) {
  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     user.type(contactNumberInput, validFormTestData[0].contactNumber);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const lastNameErrorTxt = screen.getByTestId("test-last-name-err-text");

  //   await waitFor(() => {
  //     expect(lastNameErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should disable the next button if the last name field is empty ", async () => {
  //   const lastNameInput = screen.getByPlaceholderText("Last Name");

  //   await user.type(lastNameInput, "");

  //   const firstNameInput = screen.getByPlaceholderText("First Name");

  //   await user.type(firstNameInput, validFormTestData[0].firstName);

  //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //   await user.type(contactNumberInput, validFormTestData[0].contactNumber);

  //   const maleButton = screen.getByText("Male");
  //   const femaleButton = screen.getByText("Female");

  //   await user.press(
  //     validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //   );

  //   const nextButton = screen.getByRole("button", { name: "NEXT" });

  //   await waitFor(() => {
  //     expect(nextButton).toBeDisabled();
  //   });
  // });

  // it.each(validFormTestData)(
  //   "should allow user to enter $contactNumber as their contact number",
  //   async (data) => {
  //     const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //     await user.type(contactNumberInput, data.contactNumber);

  //     const contactNumberErrorTxt = screen.getByTestId(
  //       "test-contact-number-err-text",
  //     );

  //     await waitFor(() => {
  //       expect(contactNumberInput.props.value).toBe(data.contactNumber);
  //       expect(contactNumberErrorTxt.children[0]).toBeFalsy();
  //     });
  //   },
  // );

  // it("should warn user if phone number provided has non-digit characters when shifiting focus away from the contact number field ", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });
  //   const randomPhoneNumber =
  //     invalidPhoneNumbers[
  //       faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
  //     ];

  //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //   await user.type(contactNumberInput, randomPhoneNumber);

  //   if (formField == 0) {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, validFormTestData[0].firstName);
  //   }

  //   if (formField == 1) {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, validFormTestData[0].lastName);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const contactNumberErrorTxt = screen.getByTestId(
  //     "test-contact-number-err-text",
  //   );

  //   await waitFor(() => {
  //     expect(contactNumberErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should warn user if phone number provided has non-digit characters when shifiting focus away from the contact number field ", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });
  //   const randomPhoneNumber =
  //     invalidPhoneNumbers[
  //       faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
  //     ];

  //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //   await user.type(contactNumberInput, randomPhoneNumber);

  //   if (formField == 0) {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, validFormTestData[0].firstName);
  //   }

  //   if (formField == 1) {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, validFormTestData[0].lastName);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const contactNumberErrorTxt = screen.getByTestId(
  //     "test-contact-number-err-text",
  //   );

  //   await waitFor(() => {
  //     expect(contactNumberErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it("should warn user if phone number provided has non-digit characters when shifiting focus away from the contact number field ", async () => {
  //   const formField = faker.number.int({ min: 0, max: 2 });
  //   const randomPhoneNumber =
  //     invalidPhoneNumbers[
  //       faker.number.int({ min: 0, max: invalidPhoneNumbers.length })
  //     ];

  //   const contactNumberInput = screen.getByPlaceholderText("Contact No.");

  //   await user.type(contactNumberInput, randomPhoneNumber);

  //   if (formField == 0) {
  //     const firstNameInput = screen.getByPlaceholderText("First Name");

  //     await user.type(firstNameInput, validFormTestData[0].firstName);
  //   }

  //   if (formField == 1) {
  //     const lastNameInput = screen.getByPlaceholderText("Last Name");

  //     await user.type(lastNameInput, validFormTestData[0].lastName);
  //   }

  //   if (formField == 2) {
  //     const maleButton = screen.getByText("Male");
  //     const femaleButton = screen.getByText("Female");

  //     await user.press(
  //       validFormTestData[0].gender === "male" ? maleButton : femaleButton,
  //     );
  //   }

  //   const contactNumberErrorTxt = screen.getByTestId(
  //     "test-contact-number-err-text",
  //   );

  //   await waitFor(() => {
  //     expect(contactNumberErrorTxt.children[0]).toBeTruthy();
  //   });
  // });

  // it.each(validTestData)(
  //   "Should accept a $gender user with the name $firstName $lastName and his/her $contactNumber, ",
  //   async (data) => {
  //     // const token = "jwttoken";
  //     // mockGetToken.mockResolvedValue(token);
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
