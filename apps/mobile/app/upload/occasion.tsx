import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useUploadStore } from '../../src/store/uploadStore';
import { useAuthStore } from '../../src/store/authStore';
import { useFeedbackStore } from '../../src/store/feedbackStore';
import { outfitService } from '../../src/services/outfitService';
import { feedbackService } from '../../src/services/feedbackService';
import { OCCASION_LABELS, type Occasion } from '@fitcheck/shared';
import { useToast } from '../../src/components/ui/Toast';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';

const OCCASIONS = Object.entries(OCCASION_LABELS) as [Occasion, string][];

export default function OccasionScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { showToast } = useToast();
  const { setFeedback } = useFeedbackStore();
  
  const { imageUri, imageMimeType, occasion, setOccasion, notes, setNotes, reset } = useUploadStore();
  
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!token || !imageUri || !occasion) return;

    setIsUploading(true);
    try {
      const outfit = await outfitService.uploadOutfit({
        imageUri,
        mimeType: imageMimeType,
        occasion,
        notes: notes || undefined,
        token,
      });

      showToast({ message: 'Outfit uploaded! Generating feedback...', type: 'success' });

      const feedback = await feedbackService.generateFeedback(outfit.id, token);
      setFeedback(outfit.id, feedback);

      showToast({ message: 'AI feedback ready! 🎉', type: 'success' });

      reset();
      router.replace(`/feedback/${outfit.id}` as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      showToast({ message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScreenContainer padBottom={false}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: Spacing.lg }]}>
          <MotiView from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </MotiView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 100 }}
            style={styles.titleBlock}
          >
            <Text style={styles.title}>Context</Text>
            <Text style={styles.subtitle}>Help your AI stylist understand the vibe.</Text>
          </MotiView>

          {imageUri && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 600, delay: 200 }}
              style={styles.thumbnailContainer}
            >
              <Image source={{ uri: imageUri }} style={styles.thumbnail} />
            </MotiView>
          )}

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>What's the occasion?</Text>
            <View style={styles.chipGrid}>
              {OCCASIONS.map(([key, label]) => {
                const isSelected = occasion === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setOccasion(key)}
                    activeOpacity={0.7}
                    disabled={isUploading}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 400 }}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Any specific notes? (Optional)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. It's an outdoor wedding, but it might get cold at night."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                editable={!isUploading}
                textAlignVertical="top"
                selectionColor={Colors.accent}
              />
            </View>
          </MotiView>
        </ScrollView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 500 }}
          style={[styles.footer, { paddingBottom: insets.bottom || Spacing.xl }]}
        >
          <AnimatedButton
            label="Get Feedback"
            variant="accent"
            size="large"
            onPress={handleSubmit}
            disabled={!occasion}
            loading={isUploading}
          />
        </MotiView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing['4xl'] },
  titleBlock: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography['3xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.md,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
    ...Shadow.sm,
  },
  thumbnail: {
    width: 140,
    height: 180,
    borderRadius: Radius.xl,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: {
    fontSize: Typography.base,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  chipActive: { backgroundColor: Colors.graphite, borderColor: Colors.graphite },
  chipText: { fontSize: Typography.sm, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  chipTextActive: { color: Colors.textInverse, fontFamily: 'Inter_600SemiBold' },
  inputWrapper: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    minHeight: 120,
  },
  textInput: {
    fontSize: Typography.base,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
    lineHeight: Typography.base * Typography.lineHeight.relaxed,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.bg,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  submitButtonDisabled: { backgroundColor: Colors.bgTertiary, opacity: 0.8, shadowOpacity: 0 },
  submitButtonText: {
    fontSize: Typography.lg,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
  },
});
