import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { useShimmerAnimation } from '../../hooks/useShimmerAnimation';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.md, style }: SkeletonProps) {
  const shimmerValue = useShimmerAnimation();

  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [Colors.bgSecondary, Colors.bgTertiary, Colors.bgSecondary],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius, backgroundColor },
        style,
      ]}
    />
  );
}

// ── Preset Skeletons ──────────────────────────────────────────────────────────
export function OutfitCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={200} borderRadius={Radius.xl} />
      <View style={styles.cardContent}>
        <Skeleton height={14} width="60%" />
        <View style={{ height: 6 }} />
        <Skeleton height={12} width="40%" />
      </View>
    </View>
  );
}

export function FeedbackSkeleton() {
  return (
    <View style={styles.feedbackContainer}>
      <Skeleton height={120} borderRadius={Radius.xl} />
      <View style={{ height: 16 }} />
      <Skeleton height={16} width="70%" />
      <View style={{ height: 8 }} />
      <Skeleton height={12} />
      <View style={{ height: 6 }} />
      <Skeleton height={12} width="80%" />
      <View style={{ height: 6 }} />
      <Skeleton height={12} width="60%" />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  feedbackContainer: {
    padding: 16,
  },
});
