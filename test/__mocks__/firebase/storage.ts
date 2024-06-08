const getStorage = jest.fn(() => ({
  app: {},
}));

const ref = jest.fn();

const uploadBytes = jest.fn();

export { getStorage, ref, uploadBytes };