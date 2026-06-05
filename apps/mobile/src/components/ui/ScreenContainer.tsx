import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padTop?: boolean;
  padBottom?: boolean;
  backgroundColor?: string;
}

export function ScreenContainer({ 
  children, 
  style, 
  padTop = true, 
  padBottom = false,
  backgroundColor = Colors.bg
}: Props) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor,
        paddingTop: padTop ? insets.top : 0,
        paddingBottom: padBottom ? insets.bottom : 0,
      },
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
