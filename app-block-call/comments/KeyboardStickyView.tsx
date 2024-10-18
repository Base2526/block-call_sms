import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  NativeModules,
  ViewStyle,
  StyleProp
} from 'react-native';

const { StatusBarManager } = NativeModules;

const IOS_OFFSET = 44;

const getVerticalOffset = (statusBarHeight: number) => Platform.select({
  ios: statusBarHeight + IOS_OFFSET,
  android: 0
});

interface KeyboardStickyViewProps {
  style?: StyleProp<ViewStyle>; // Accepts custom styles
  children: React.ReactNode; // Accepts children components
}

const KeyboardStickyView: React.FC<KeyboardStickyViewProps> = ({ style, children, ...other }) => {
  const [statusBarHeight, setStatusBarHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      StatusBarManager.getHeight((statusBarFrameData: { height: number }) => {
        setStatusBarHeight(statusBarFrameData.height);
      });
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={getVerticalOffset(statusBarHeight)}
      {...other} // can receive other view props
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});

export default KeyboardStickyView;
