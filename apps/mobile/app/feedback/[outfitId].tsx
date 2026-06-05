import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { MotiView, MotiText } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { useFeedbackStore } from '../../src/store/feedbackStore';
import { feedbackService } from '../../src/services/feedbackService';
import { outfitService } from '../../src/services/outfitService';
import { FeedbackSkeleton } from '../../src/components/ui/Skeleton';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import type { Feedback } from '@fitcheck/shared';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FeedbackScreen() {
  const { outfitId } = useLocalSearchParams<{ outfitId: string }>();
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { getFeedback } = useFeedbackStore();

  // Check store cache first
  const cachedFeedback = getFeedback(outfitId);

  const { data: outfit } = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => outfitService.getOutfit(outfitId, token!),
    enabled: !!token && !!outfitId,
  });

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', outfitId],
    queryFn: () => feedbackService.getFeedback(outfitId, token!),
    enabled: !!token && !!outfitId && !cachedFeedback,
    initialData: cachedFeedback,
  });

  if (isLoading) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} title="Analysis" />
        <FeedbackSkeleton />
      </View>
    );
  }

  if (!feedback) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: insets.top }]}>
        <Header onBack={() => router.back()} title="Analysis" />
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Feedback not available</Text>
      </View>
    );
  }

  const scoreColor = Colors.accent;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Outfit Hero Image ── */}
        <MotiView
          from={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.heroContainer}
        >
          {outfit?.imageUrl && (
            <Image source={{ uri: outfit.imageUrl }} style={styles.heroImage} />
          )}
          <View style={styles.heroOverlay} />
          
          <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonOverlay} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={24} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* ── Score Card (Overlapping) ── */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 300 }}
          style={styles.scoreCardContainer}
        >
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Text style={styles.scoreTitle}>Overall Style</Text>
              <View style={styles.scoreNumberContainer}>
                <ScoreCounter targetScore={feedback.overallScore} color={scoreColor} />
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              {feedback.styleLabel && (
                <View style={styles.styleChip}>
                  <Text style={styles.styleChipText}>{feedback.styleLabel}</Text>
                </View>
              )}
              <ConfidenceBadge level={feedback.confidenceLevel} />
            </View>
          </View>
        </MotiView>

        <View style={styles.detailsContainer}>
          {/* ── Highlights ── */}
          {feedback.highlights && feedback.highlights.length > 0 && (
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 400 }}>
              <FeedbackSection title="Highlights">
                {feedback.highlights.map((h: string, i: number) => (
                  <BulletItem key={i} text={h} icon="checkmark-outline" iconColor={Colors.success} />
                ))}
              </FeedbackSection>
            </MotiView>
          )}

          {/* ── Stylist Notes ── */}
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 500 }}>
            <View style={styles.stylistNotesCard}>
              <View style={styles.stylistHeader}>
                <Ionicons name="sparkles" size={16} color={Colors.accent} />
                <Text style={styles.stylistTitle}>Stylist Notes</Text>
              </View>
              
              <NoteSection label="Fit & Silhouette" text={feedback.fitFeedback} />
              <NoteSection label="Color Harmony" text={feedback.colorReview} />
              <NoteSection label="Occasion Match" text={feedback.occasionMatch} isLast />
            </View>
          </MotiView>

          {/* ── Suggestions ── */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 600 }}>
              <FeedbackSection title="To Improve">
                {feedback.suggestions.map((s: string, i: number) => (
                  <BulletItem key={i} text={s} icon="remove-outline" iconColor={Colors.textSecondary} />
                ))}
              </FeedbackSection>
            </MotiView>
          )}

          {/* ── Actions ── */}
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 700 }}>
            <AnimatedButton
              label="Done"
              size="large"
              onPress={() => router.replace('/(tabs)')}
              containerStyle={{ marginTop: Spacing.lg }}
            />
          </MotiView>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreCounter({ targetScore, color }: { targetScore: number; color: string }) {
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    let current = 0;
    const duration = 1500;
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const increment = targetScore / steps;

    const interval = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setScore(targetScore);
        clearInterval(interval);
      } else {
        setScore(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [targetScore]);

  return (
    <MotiText
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 12, delay: 400 }}
      style={[styles.scoreNumber, { color }]}
    >
      {score}
    </MotiText>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function FeedbackSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function NoteSection({ label, text, isLast }: { label: string; text: string; isLast?: boolean }) {
  return (
    <View style={[styles.noteSection, !isLast && styles.noteSectionBorder]}>
      <Text style={styles.noteLabel}>{label}</Text>
      <Text style={styles.noteText}>{text}</Text>
    </View>
  );
}

function BulletItem({ text, icon, iconColor }: { text: string; icon?: keyof typeof Ionicons.glyphMap; iconColor?: string }) {
  return (
    <View style={styles.bulletRow}>
      {icon ? (
        <Ionicons name={icon} size={16} color={iconColor || Colors.accent} style={styles.bulletIcon} />
      ) : (
        <View style={styles.bulletDot} />
      )}
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ConfidenceBadge({ level }: { level: Feedback['confidenceLevel'] }) {
  const map = {
    high: { color: Colors.accent, label: 'High Confidence' },
    medium: { color: Colors.warning, label: 'Medium Confidence' },
    low: { color: Colors.error, label: 'Low Confidence' },
  };
  const { color, label } = map[level];
  return (
    <View style={[styles.confidenceBadge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.confidenceText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  content: { paddingBottom: 0 },
  
  // Hero Image
  heroContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 1.3,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  backButtonOverlay: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Score Card
  scoreCardContainer: {
    marginTop: -80,
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  scoreCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    padding: Spacing['xl'],
    ...Shadow.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scoreTitle: {
    fontSize: Typography.lg,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
  },
  scoreNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNumber: {
    fontSize: Typography['4xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  scoreMax: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  styleChip: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  styleChipText: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  confidenceBadge: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  confidenceText: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },

  detailsContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },

  // Standard Sections
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.widest,
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Stylist Notes
  stylistNotesCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  stylistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stylistTitle: {
    fontSize: Typography.lg,
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
  },
  noteSection: {
    paddingVertical: Spacing.md,
  },
  noteSectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noteLabel: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.widest,
    marginBottom: Spacing.xs,
  },
  noteText: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },

  // Bullets
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  bulletIcon: {
    marginTop: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },

  // Fallbacks
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md },
  backButton: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { fontSize: Typography.xl, fontFamily: 'PlayfairDisplay_600SemiBold', color: Colors.textPrimary },
  errorText: { fontSize: Typography.base, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: Spacing.md },
});
