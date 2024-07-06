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
import { UserContext } from "Contexts/UserContext";
import fetch from "jest-fetch-mock";
import * as React from "react";
import ProfileForm from "screens/Users/Profile/Form";
import { UserProfile, ScreenProps } from "types/types";

import Home from ".";

const setUserMock = jest.fn();

const mockUser: UserProfile = {
  _id: "",
  email: "",
  lastName: "Doe",
  firstName: "John",
  contactNumber: "1234567890",
  gender: "male",
  events: [],
  chats: [],
  vendorId: "vendor123",
};

const TestHomeComponent = () => {
  const TestHomeStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <UserContext.Provider value={{ user: mockUser, setUser: setUserMock }}>
        <TestHomeStack.Navigator>
          <TestHomeStack.Screen
            name="Home"
            component={Home}
            initialParams={{ initialTab: "EventList"}}
          />
          <TestHomeStack.Screen name="ProfileForm" component={ProfileForm} />
        </TestHomeStack.Navigator>
      </UserContext.Provider>
    </NavigationContainer>
  );
};

let mockGetToken: jest.Mock;
const mockUserId = "mock-user-id";
const token = "mock-jwt-token";
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

let user: UserEventInstance;

beforeEach(async () => {
  jest.useFakeTimers();
  mockGetToken = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    userId: mockUserId,
    isLoaded: true,
    getToken: mockGetToken.mockReturnValue(token),
  });

  (useUser as jest.Mock).mockReturnValue({
    user: {
      primaryEmailAddress: {
        emailAddress: "mockEmail@mock.com",
      },
    },
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

describe("Home", () => {
  it("should navigate the user to the Profile Form screen if no profile data is found in the backend.", async () => {
    const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/${mockUserId}`;

    fetch.once(url, {
      status: 404,
      headers,
    });

    await waitFor(() => {
      render(<TestHomeComponent />);
    });

    const request = {
      method: "GET",
      headers,
    };

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

    await waitFor(async () => {
      expect(mockGetToken).toHaveBeenCalledWith({ template: "event-hand-jwt" });
      expect(fetch).toHaveBeenCalledWith(url, request);
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

  it("should proceed to the home screen, if user profile data is found in the database", async () => {
    const gender = faker.person.sexType();

    const userProfile = {
      avatar: faker.image.avatar(),
      email: faker.internet.email(),
      lastName: faker.person.lastName(gender),
      firstName: faker.person.firstName(gender),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender,
      events: [],
      chats: [],
      vendorId: "",
    };

    fetch.once(JSON.stringify(userProfile), {
      status: 200,
      headers,
    });

    await waitFor(() => {
      render(<TestHomeComponent />);
    });

    const eventsNavbtn = screen.getByTestId("events-nav-btn");
    const chatNavbtn = screen.getByTestId("chat-nav-btn");
    const profileNavbtn = screen.getByTestId("profile-nav-btn");

    waitFor(() => {
      expect(eventsNavbtn).toBeOnTheScreen();
      expect(chatNavbtn).toBeOnTheScreen();
      expect(profileNavbtn).toBeOnTheScreen();
    });
  });

  it("should navigate the user to the events screen if the booking button is pressed in the bottom navigation bar", async () => {
    const gender = faker.person.sexType();

    const userProfile = {
      avatar: faker.image.avatar(),
      lastName: faker.person.lastName(gender),
      firstName: faker.person.firstName(gender),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender,
      events: [],
      chats: [],
      vendorId: "",
    };

    fetch.once(JSON.stringify(userProfile), {
      status: 200,
      headers,
    });

    await waitFor(() => {
      render(<TestHomeComponent />);
    });

    const eventsNavbtn = screen.getByTestId("events-nav-btn");

    await user.press(eventsNavbtn);

    const eventsScreen = screen.getByTestId("test-events");

    waitFor(() => {
      expect(eventsScreen).toBeOnTheScreen();
    });
  });

  it("should navigate the user to the chat screenif the chat button is pressed in the bottom navigation bar", async () => {
    const gender = faker.person.sexType();

    const userProfile = {
      avatar: faker.image.avatar(),
      lastName: faker.person.lastName(gender),
      firstName: faker.person.firstName(gender),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender,
      events: [],
      chats: [],
      vendorId: "",
    };

    fetch.once(JSON.stringify(userProfile), {
      status: 200,
      headers,
    });

    await waitFor(() => {
      render(<TestHomeComponent />);
    });

    const chatNavbtn = screen.getByTestId("chat-nav-btn");

    await user.press(chatNavbtn);

    const chat = screen.getByTestId("chat");

    waitFor(() => {
      expect(chat).toBeOnTheScreen();
    });
  });

  it("should navigate the user to the profile screen if the profile button is pressed in the bottom navigation bar", async () => {
    const gender = faker.person.sexType();

    const userProfile = {
      avatar: faker.image.avatar(),
      lastName: faker.person.lastName(gender),
      firstName: faker.person.firstName(gender),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender,
      events: [],
      chats: [],
      vendorId: "",
    };

    fetch.once(JSON.stringify(userProfile), {
      status: 200,
      headers,
    });

    await waitFor(() => {
      render(<TestHomeComponent />);
    });

    await user.press(screen.getByTestId("profile-nav-btn"));

    const profile = screen.getByTestId("test-profile");

    waitFor(() => {
      expect(profile).toBeOnTheScreen();
    });
  });
});
