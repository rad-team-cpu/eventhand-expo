// @ts-nocheck
import "@testing-library/react-native/extend-expect";
import fetchMock from "jest-fetch-mock";

global.window = {};
global.window = global;
global.alert = jest.fn();
fetchMock.enableMocks();

