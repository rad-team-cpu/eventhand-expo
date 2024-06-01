module.exports = {
    preset: "jest-expo",
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase/.*)'
    ],
    moduleNameMapper: {
      '@expo/vector-icons': "./test/__mocks__/@expo/vector-icons.tsx",
      "^expo-file-system$": "./test/__mocks__/expo-file-system.ts",
      "^expo-image-picker$": "./test/__mocks__/expo-image-picker.ts",
      "^firebase/storage$": "./test/__mocks__/firebase/storage.ts",
      "^firebase/app$": "./test/__mocks__/firebase/app.ts",
      // "^react-native/Libraries/Utilities/BackHandler$": "<rootDir>/__mocks__/react-native/Libraries/Utilities/BackHandler.ts",
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ["./test/setupAfterEnv.ts"],
    setupFiles: [
      "./test/setup.ts",
      'dotenv/config',
    ],
  
}