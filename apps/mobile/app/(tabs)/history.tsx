import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { outfitService } from '../../src/services/outfitService';
import { OutfitCardSkeleton } from '../../src/components/ui/Skeleton';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import type { Outfit, Feedback } from '@fitcheck/shared';

import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

type OutfitWithFeedback = Outfit & {
  feedback?: Pick<Feedback, 'id' | 'overallScore' | 'confidenceLevel'> | null;
};

const STATUS_COLORS: Record<string, string> = {
  completed: Colors.accent,
  pending: Colors.warning,
  processing: Colors.accentMuted,
  failed: Colors.error,
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['outfits', 'history'],
    queryFn: ({ pageParam = 1 }) =>
      outfitService.getHistory(token!, pageParam as number, 10),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!token,
  });

  const outfits = data?.pages.flatMap((page) => page.outfits) ?? [];

  const renderItem = ({ item, index }: { item: OutfitWithFeedback; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 50 }}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/feedback/${item.id}` as never)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.occasionText}>{item.occasion} Look</Text>
          {item.feedback?.overallScore !== undefined ? (
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{item.feedback.overallScore} pts</Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <ScreenContainer padBottom={false}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>
          {data?.pages[0]?.pagination.total ?? 0} Looks
        </Text>
      </MotiView>

      {isLoading ? (
        <View style={styles.loadingGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: CARD_WIDTH }}>
              <OutfitCardSkeleton />
            </View>
          ))}
        </View>
      ) : outfits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="albums-outline" size={32} color={Colors.textSecondary} />
          </View>
          <Text style={styles.emptyTitle}>No looks yet</Text>
          <Text style={styles.emptySubtitle}>Your curated fashion history will appear here.</Text>
          <AnimatedButton
            label="Upload First Look"
            icon="camera"
            onPress={() => router.push('/(tabs)/upload')}
          />
        </View>
      ) : (
        <FlatList
          data={outfits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.accent}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loadingMore}>
                <OutfitCardSkeleton />
              </View>
            ) : null
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    fontSize: Typography['3xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
  },
  count: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  loadingGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, gap: Spacing.md },
  list: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.sm },
  row: { gap: Spacing.md, marginBottom: Spacing.md },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardImage: { width: '100%', height: CARD_WIDTH * 1.3, resizeMode: 'cover' },
  cardBody: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: 6,
  },
  occasionText: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.accent + '15',
    borderRadius: Radius.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
    textTransform: 'uppercase',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.warning + '20',
    borderRadius: Radius.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: Colors.warning,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },
  uploadButton: {
    backgroundColor: Colors.graphite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    ...Shadow.md,
  },
  uploadButtonText: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
  },
  loadingMore: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
});
