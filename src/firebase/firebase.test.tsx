import { useAuth } from "@clerk/clerk-expo";
import { userEvent, cleanup } from "@testing-library/react-native";
import { UploadResult } from "firebase/storage";

import FirebaseService from ".";
import { initializeApp } from "../../test/__mocks__/firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
} from "../../test/__mocks__/firebase/storage";

beforeAll(() => {
  global.fetch = jest.fn();
});

describe("FirebaseService", () => {
  let firebaseService: FirebaseService;

  beforeEach(() => {
    initializeApp.mockReturnValue({});
    firebaseService = FirebaseService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should create a single instance", () => {
    const instance1 = FirebaseService.getInstance();
    const instance2 = FirebaseService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should upload a file", async () => {
    const mockRef = "";
    const mockBlob = new Blob(["test"], { type: "text/plain" });
    const mockFileRef = { fullPath: "mockPath" };
    const mockResult = {
      ref: "",
      metadata: {
        bucket: "",
        fullPath: "",
        generation: "",
        metageneration: "",
        name: "",
        size: 0,
        timeCreated: "",
        updated: "",
        downloadTokens: undefined,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob),
    });
    ref.mockReturnValue(mockFileRef);
    uploadBytes.mockResolvedValue(mockResult);

    const result = await firebaseService.uploadFile("testFile.txt", "testUri");
    expect(fetch).toHaveBeenCalledWith("testUri");
    expect(ref).toHaveBeenCalledWith(getStorage(), "testFile.txt");
    expect(uploadBytes).toHaveBeenCalledWith(mockFileRef, mockBlob);
    expect(result).toEqual(mockResult);
  });

  it("should upload a profile avatar", async () => {
    const mockBlob = new Blob(["test"], { type: "text/plain" });
    const mockFileRef = { fullPath: "mockPath" };
    const mockResult = {
      ref: "",
      metadata: {
        bucket: "",
        fullPath: "",
        generation: "",
        metageneration: "",
        name: "",
        size: 0,
        timeCreated: "",
        updated: "",
        downloadTokens: undefined,
      },
    };

    (fetch as jest.Mock).mockResolvedValue({
      blob: jest.fn().mockResolvedValue(mockBlob),
    });
    ref.mockReturnValue(mockFileRef);
    uploadBytes.mockResolvedValue(mockResult);

    const image = { uri: "testUri", fileExtension: "jpg" };
    const result = await firebaseService.uploadProfileAvatar("userId", image);

    expect(fetch).toHaveBeenCalledWith("testUri");
    expect(ref).toHaveBeenCalledWith(
      getStorage(),
      "images/userId/profile/avatar.jpg",
    );
    expect(uploadBytes).toHaveBeenCalledWith(mockFileRef, mockBlob);
    expect(result).toEqual(mockResult);
  });

  it("should throw an error if image uri is invalid", async () => {
    const image = { uri: "", fileExtension: "jpg" };

    await expect(
      firebaseService.uploadProfileAvatar("userId", image),
    ).rejects.toThrow("Invalid Uri");
  });
});
