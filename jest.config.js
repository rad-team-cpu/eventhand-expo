module.exports = {
    preset: "jest-expo",
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase/.*)'
    ],
    moduleNameMapper: {
      '@expo/vector-icons': "<rootDir>/test/__mocks__/@expo/vector-icons.tsx",
      "^expo-file-system$": "<rootDir>/test/__mocks__/expo-file-system.ts",
      "^expo-image-picker$": "<rootDir>/test/__mocks__/expo-image-picker.ts",
      "^firebase/storage$": "<rootDir>/test/__mocks__/firebase/storage.ts",
      "^firebase/app$": "<rootDir>/test/__mocks__/firebase/app.ts",
      '^screens/(.*)$': '<rootDir>/src/screens/$1',
      '^Components/(.*)$': '<rootDir>/src/Components/$1',
      '^Contexts/(.*)$': '<rootDir>/src/Contexts/$1',
      '^types/(.*)$': '<rootDir>/src/types/$1',
      '^service/(.*)$': '<rootDir>/src/service/$1'
      // "^react-native/Libraries/Utilities/BackHandler$": "<rootDir>/__mocks__/react-native/Libraries/Utilities/BackHandler.ts",
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ["<rootDir>/test/setupAfterEnv.ts"],
    setupFiles: [
      "<rootDir>/test/setup.ts",
      'dotenv/config',
    ],
  
}