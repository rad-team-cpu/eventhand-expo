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
import { UserContext } from "Contexts/UserContext";
import fetch from "jest-fetch-mock";
import * as React from "react";
import Home from "screens/Users/Home";
import { ScreenProps, UserProfile } from "types/types";

import { getDownloadURL } from "../../../../../test/__mocks__/firebase/storage";
import Profile from "../index";

interface TestProfileComponentProps {
  mockUser: UserProfile;
}

const setUserMock = jest.fn();

const gender = faker.person.sexType();

const mockUser: UserProfile = {
  profilePicture: faker.image.avatar(),
  email: faker.internet.email(),
  lastName: faker.person.lastName(gender),
  firstName: faker.person.firstName(gender),
  contactNumber: `09${faker.string.numeric(9)}`,
  gender,
  events: [],
  chats: [],
  vendorId: "",
};

const TestProfileComponent = (props: TestProfileComponentProps) => {
  const { mockUser } = props;
  const TestProfileStack = createNativeStackNavigator<ScreenProps>();

  return (
    <NavigationContainer>
      <UserContext.Provider value={{ user: mockUser, setUser: setUserMock }}>
        <TestProfileStack.Navigator>
          <TestProfileStack.Screen
            name="Home"
            component={Home}
            initialParams={{ initialTab: "Profile", noFetch: true }}
          />
        </TestProfileStack.Navigator>
      </UserContext.Provider>
    </NavigationContainer>
  );
};

let mockSignOut: jest.Mock;
let user: UserEventInstance;

beforeEach(() => {
  jest.useFakeTimers();
  mockSignOut = jest.fn();

  (useAuth as jest.Mock).mockReturnValue({
    isLoaded: true,
    signOut: mockSignOut,
  });

  (useUser as jest.Mock).mockReturnValue({
    user: {
      primaryEmailAddress: {
        emailAddress: mockUser.email,
      },
    },
  });

  user = userEvent.setup();

});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  cleanup();
});

describe("Profile", () => {
  it("Should allow the user to logout his/her session", async () => {


    await waitFor(() => {
      render(<TestProfileComponent mockUser={mockUser} />);
    });

    const signOutButton = screen.getByRole("button", { name: "Sign Out" });

    await user.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("should display the user's name, avatar, contact number, and emailAddress ", async () => {
    const mockAvatar = mockUser.profilePicture;
    getDownloadURL.mockResolvedValue(mockAvatar);

    await waitFor(() => {
      render(<TestProfileComponent mockUser={mockUser} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("test-avatar-label")).toHaveTextContent(
        `${mockUser.firstName} ${mockUser.lastName}`,
      );
      expect(screen.getByTestId("test-profile-contact-num")).toHaveTextContent(
        mockUser.contactNumber,
      );
      expect(screen.getByTestId("test-profile-email")).toHaveTextContent(
        mockUser.email,
      );
      expect(screen.getByTestId("test-avatar-image").props.source.uri).toBe(
        mockUser.profilePicture,
      );
    });
  });

  it("should display a default avatar image if user has no saved avatar", async () => {
    const mockUser: UserProfile = {
      email: faker.internet.email(),
      lastName: faker.person.lastName(gender),
      firstName: faker.person.firstName(gender),
      contactNumber: `09${faker.string.numeric(9)}`,
      gender,
      events: [],
      chats: [],
      vendorId: "",
    };

    const defaultImage = require("../../../../assets/images/user.png");

    await waitFor(() => {
      render(<TestProfileComponent mockUser={mockUser} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("test-avatar-image").props.source).toBe(
        defaultImage,
      );
    });
  });
});
