import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { outfitService } from '../../src/services/outfitService';
import { OutfitCardSkeleton } from '../../src/components/ui/Skeleton';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import type { Outfit, Feedback } from '@fitcheck/shared';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OutfitWithFeedback = Outfit & {
  feedback?: Pick<Feedback, 'id' | 'overallScore' | 'confidenceLevel'> | null;
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, token } = useAuthStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['outfits', 'recent'],
    queryFn: () => outfitService.getHistory(token!, 1, 4),
    enabled: !!token,
  });

  useFocusEffect(
    useCallback(() => {
      if (token) {
        refetch();
      }
    }, [token, refetch])
  );

  const recentOutfits: OutfitWithFeedback[] = (data?.outfits ?? []) as OutfitWithFeedback[];
  const greeting = getGreeting();

  return (
    <ScreenContainer padBottom={false}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingTop: Spacing.xl, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.topBar}
        >
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Stylist'}</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{(user?.name?.[0] || 'U').toUpperCase()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </MotiView>

      {/* ── Hero CTA ── */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 600, delay: 100 }}
        style={{ marginBottom: Spacing['xl'] }}
      >
        <AnimatedButton
          label="Analyze Outfit"
          icon="camera"
          size="large"
          onPress={() => router.push('/(tabs)/upload')}
        />
        <Text style={[styles.heroSub, { textAlign: 'center', marginTop: Spacing.md }]}>
          Get AI-powered feedback on your look before you head out.
        </Text>
      </MotiView>

      {/* ── Stats ── */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 200 }}
        style={styles.statsRow}
      >
        <StatCard
          icon="albums-outline"
          value={data?.pagination.total ?? 0}
          label="Looks"
        />
        <StatCard
          icon="star-outline"
          value={recentOutfits.filter(o => o.feedback).length}
          label="Analyzed"
        />
        <StatCard
          icon="trending-up-outline"
          value={
            recentOutfits.length > 0
              ? Math.round(
                  recentOutfits
                    .filter(o => o.feedback?.overallScore)
                    .reduce((sum, o) => sum + (o.feedback?.overallScore ?? 0), 0) /
                    Math.max(1, recentOutfits.filter(o => o.feedback).length)
                )
              : 0
          }
          label="Avg Score"
        />
      </MotiView>

      {/* ── Recent Outfits ── */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 300 }}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Looks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/history')} activeOpacity={0.8}>
            <Text style={styles.sectionAction}>See all</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <>
            <OutfitCardSkeleton />
            <OutfitCardSkeleton />
          </>
        ) : recentOutfits.length === 0 ? (
          <EmptyState onUpload={() => router.push('/(tabs)/upload')} />
        ) : (
          recentOutfits.map((outfit, index) => (
            <MotiView
              key={outfit.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 400 + index * 100 }}
            >
              <OutfitCard
                outfit={outfit}
                onPress={() => router.push(`/feedback/${outfit.id}` as never)}
              />
            </MotiView>
          ))
        )}
      </MotiView>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({ icon, value, label }: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrapper}>
        <Ionicons name={icon} size={20} color={Colors.accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OutfitCard({ outfit, onPress }: { outfit: OutfitWithFeedback; onPress: () => void }) {
  const score = outfit.feedback?.overallScore;
  const isPending = outfit.status === 'pending';

  return (
    <TouchableOpacity style={styles.outfitCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
      <View style={styles.outfitMeta}>
        <View>
          <Text style={styles.outfitOccasion}>
            {outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)} Look
          </Text>
          <Text style={styles.outfitDate}>
            {new Date(outfit.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        
        {isPending ? (
          <View style={[styles.scoreBadge, { backgroundColor: Colors.warning + '20' }]}>
            <Text style={[styles.scoreText, { color: Colors.warning }]}>Pending</Text>
          </View>
        ) : score !== undefined ? (
          <View style={[styles.scoreBadge, { backgroundColor: Colors.accent + '15' }]}>
            <Text style={[styles.scoreText, { color: Colors.accent }]}>{score} pts</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="images-outline" size={32} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No looks yet</Text>
      <Text style={styles.emptySubtitle}>Upload your first outfit to get started with your AI stylist.</Text>
      <AnimatedButton
        label="Upload Outfit"
        onPress={onUpload}
        containerStyle={{ marginTop: Spacing.sm }}
      />
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  greeting: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.widest,
    marginBottom: 4,
  },
  userName: {
    fontSize: Typography['3xl'],
    color: Colors.textPrimary,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  avatarButton: {
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: Typography.lg,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.accent,
  },
  heroCta: {
    backgroundColor: Colors.accent,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
    ...Shadow.md,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: Spacing.lg,
  },
  heroTitle: {
    fontSize: Typography.xl,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  heroSub: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textInverse,
    opacity: 0.9,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography['2xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
  outfitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  outfitImage: {
    width: 110,
    height: 110,
  },
  outfitMeta: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  outfitOccasion: {
    fontSize: Typography.md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  outfitDate: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  scoreText: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
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
    fontSize: Typography['2xl'],
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.xl,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },
  emptyButton: {
    backgroundColor: Colors.graphite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    ...Shadow.md,
  },
  emptyButtonText: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
  },
});
