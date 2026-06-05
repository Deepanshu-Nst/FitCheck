import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { MotiView, MotiText } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadow, Spacing, Typography, Radius } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
          if (route.name === 'upload') iconName = isFocused ? 'add-circle' : 'add-circle-outline';
          if (route.name === 'history') iconName = isFocused ? 'grid' : 'grid-outline';
          if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <MotiView
                animate={{
                  scale: isFocused ? 1.05 : 1,
                  translateY: isFocused ? -8 : 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 250,
                }}
                style={styles.iconContainer}
              >
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? Colors.textPrimary : Colors.textMuted}
                />
              </MotiView>
              {isFocused && (
                <MotiText
                  from={{ opacity: 0, translateY: 10, scale: 0.8 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 50 }}
                  style={styles.label}
                >
                  {label as string}
                </MotiText>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    width: SCREEN_WIDTH - Spacing.xl * 2,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    ...Shadow.md,
    borderWidth: 1,
    borderColor: 'rgba(232, 232, 230, 0.8)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    position: 'absolute',
    bottom: 12,
  },
});
