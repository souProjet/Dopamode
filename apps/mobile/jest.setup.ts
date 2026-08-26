/** Configuration Jest globale (matchers RNTL inclus dans v12+ sans extend-expect séparé). */

jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    WebView: () => React.createElement(View, { testID: 'webview-mock' }),
  };
});

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style, ...rest }: { children?: React.ReactNode; style?: object }) =>
      React.createElement(View, { style, ...rest }, children),
  };
});

jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassView: ({ children, style, ...rest }: { children?: React.ReactNode; style?: object }) =>
      React.createElement(View, { style, ...rest }, children),
    GlassContainer: ({ children, style }: { children?: React.ReactNode; style?: object }) =>
      React.createElement(View, { style }, children),
    isLiquidGlassAvailable: () => false,
    isGlassEffectAPIAvailable: () => false,
  };
});
