import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export function useShimmerAnimation(duration = 1200) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerValue, duration]);

  return shimmerValue;
}
