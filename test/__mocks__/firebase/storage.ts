const getStorage = jest.fn(() => ({
  app: {},
}));

const ref = jest.fn();

const uploadBytes = jest.fn();

const getDownloadURL = jest.fn();

export { getStorage, ref, uploadBytes, getDownloadURL };