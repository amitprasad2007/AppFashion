/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

// Unit test should not mount full navigation tree (it triggers network calls, timers, etc.)
jest.mock('../src/navigation/AppNavigator', () => {
  const ReactMock = require('react');
  return function MockAppNavigator() {
    return ReactMock.createElement(ReactMock.Fragment, null);
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
