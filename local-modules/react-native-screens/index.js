import { View } from 'react-native';

// Mock implementation that does nothing
export function enableScreens() {
  console.warn('Using mock react-native-screens implementation');
  return false;
}

export function screensEnabled() {
  return false;
}

// Mock all the components with simple Views
export const Screen = View;
export const ScreenContainer = View;
export const ScreenStack = View;
export const ScreenStackHeaderConfig = View;
export const ScreenStackHeaderSubview = View;
export const ScreenStackHeaderCenterView = View;
export const ScreenStackHeaderRightView = View;
export const ScreenStackHeaderLeftView = View;

export default {
  enableScreens,
  screensEnabled,
  Screen,
  ScreenContainer,
  ScreenStack,
  ScreenStackHeaderConfig,
  ScreenStackHeaderSubview,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderRightView,
  ScreenStackHeaderLeftView
}; 