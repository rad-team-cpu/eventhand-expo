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

  render(<ProfileForm setNewUserId={setNewUserId} />);

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
  const validTestData = [
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

  it("should display a field for last name, first name, contact number, gender buttons, birth date selection, and a submit button", async () => {
    const firstNameInput = screen.getByPlaceholderText("First Name");
    const lastNameInput = screen.getByPlaceholderText("Last Name");
    const contactNumberInput = screen.getByPlaceholderText("Contact No.");
    const maleButton = screen.getByText("Male");
    const femaleButton = screen.getByText("Female");
    const nextButton = screen.getByRole("button", { name: "NEXT" });

    await waitFor(() => {
      expect(firstNameInput).toBeOnTheScreen();
      expect(lastNameInput).toBeOnTheScreen();
      expect(contactNumberInput).toBeOnTheScreen();
      expect(maleButton).toBeOnTheScreen();
      expect(femaleButton).toBeOnTheScreen();
      expect(nextButton).toBeOnTheScreen();
    });
  });

  it.each(validTestData)(
    "Should accept a $gender user with the name $firstName $lastName and his/her $contactNumber, ",
    async (data) => {
      // const token = "jwttoken";
      // mockGetToken.mockResolvedValue(token);
      // const url = "";
      // const request = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${mockGetToken()}`,
      //   },
      //   body: JSON.stringify({ ...data, gender: data.gender.toUpperCase() }),
      // };
      // const nextButton = screen.getByRole("button", { name: "NEXT" });
      let nextButton: ReactTestInstance;

      await waitFor(() => {
        nextButton = screen.getByRole("button", { name: "NEXT" });

        expect(nextButton).toBeDisabled();
      });

      const firstNameInput = screen.getByPlaceholderText("First Name");

      await user.type(firstNameInput, data.firstName);

      const lastNameInput = screen.getByPlaceholderText("Last Name");

      await user.type(lastNameInput, data.lastName);

      const contactNumberInput = screen.getByPlaceholderText("Contact No.");

      await user.type(contactNumberInput, data.contactNumber);

      const maleButton = screen.getByText("Male");
      const femaleButton = screen.getByText("Female");

      await user.press(data.gender === "male" ? maleButton : femaleButton);

      // const nextButton = screen.getByRole("button", { name: "NEXT" });
      // await user.press(nextButton);

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        nextButton = screen.getByRole("button", { name: "NEXT" });

        // expect(mockGetToken).toHaveBeenCalledWith({
        //   template: "event-hand-jwt",
        // });
        // expect(fetch).toHaveBeenCalledWith(url, request);
        expect(nextButton).not.toBeDisabled();
      });
    },
  );
});
