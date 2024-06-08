import { faker } from "@faker-js/faker";

// const fileExtensions = ["png", "jpeg", "jpg"];

// const randomExtension =
//   fileExtensions[faker.number.int({ max: fileExtensions.length - 1 })];

const launchImageLibraryAsync = jest.fn()

// .mockResolvedValue({
//   canceled: false,
//   assets: [
//     {
//       uri: "mocked-uri",
//       fileName: `mocked-image.${randomExtension}`,
//       mimeType: `image/${randomExtension === "png" ? "png" : "jpeg"}`,
//     },
//   ],
// });

const useMediaLibraryPermissions = jest.fn().mockReturnValue([
  {
    granted: true,
  },
  jest.fn().mockResolvedValue({granted: true}),
]);

export { launchImageLibraryAsync, useMediaLibraryPermissions };
