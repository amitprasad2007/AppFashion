/* eslint-env jest */
/* global jest */

// Jest setup for React Native
// Mocks required native modules so unit tests can run in a JS-only environment.

import 'react-native-gesture-handler/jestSetup';

// AsyncStorage is a native module; Jest needs a mock.
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Razorpay is native-only; stub it for unit tests.
jest.mock('react-native-razorpay', () => ({
  open: jest.fn(() => Promise.resolve({
    razorpay_payment_id: 'test_payment_id',
    razorpay_order_id: 'test_order_id',
    razorpay_signature: 'test_signature',
  })),
}));

// Google Sign-In is native-only and the package publishes ESM; mock for Jest.
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
  },
  statusCodes: {},
}));

// Provide a lightweight mock for GestureHandlerRootView usages
jest.mock('react-native-gesture-handler', () => {
  const actual = jest.requireActual('react-native-gesture-handler');
  return {
    ...actual,
    GestureHandlerRootView: ({ children }) => children,
  };
});
