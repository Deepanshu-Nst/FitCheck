import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle, TextStyle, Text, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { Colors, Radius, Typography, Shadow, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedButtonProps extends TouchableOpacityProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  size?: 'default' | 'large';
  containerStyle?: ViewStyle;
  loading?: boolean;
}

export function AnimatedButton({
  label,
  icon,
  variant = 'primary',
  size = 'default',
  containerStyle,
  style,
  disabled,
  loading,
  onPress,
  ...rest
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: Colors.graphite,
          text: Colors.textInverse,
          border: Colors.graphite,
          shadow: Shadow.md,
        };
      case 'accent':
        return {
          bg: Colors.accent,
          text: Colors.textInverse,
          border: Colors.accent,
          shadow: Shadow.md,
        };
      case 'secondary':
        return {
          bg: Colors.bgCard,
          text: Colors.textPrimary,
          border: Colors.border,
          shadow: Shadow.sm,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: Colors.textPrimary,
          border: Colors.textPrimary,
          shadow: null,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <MotiView
      animate={{
        scale: isPressed ? 0.96 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }}
      style={[containerStyle, (disabled || loading) && styles.disabled]}
    >
      <TouchableOpacity
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[
          styles.button,
          {
            backgroundColor: vStyles.bg,
            borderColor: vStyles.border,
            borderWidth: 1,
            height: size === 'large' ? 60 : 50,
          },
          vStyles.shadow,
          style,
        ]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={vStyles.text} />
        ) : (
          <>
            <Text
              style={[
                styles.label,
                { color: vStyles.text, fontSize: size === 'large' ? Typography.lg : Typography.base },
              ]}
            >
              {label}
            </Text>
            {icon && <Ionicons name={icon} size={20} color={vStyles.text} style={styles.icon} />}
          </>
        )}
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
  },
  icon: {
    marginLeft: Spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
