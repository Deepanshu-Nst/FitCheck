import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/services/apiClient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { STYLE_OPTIONS, COLOR_OPTIONS, OCCASION_LABELS } from '@fitcheck/shared';
import { useToast } from '../../src/components/ui/Toast';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuthStore();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  const handleToggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleToggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleToggleOccasion = (occasion: string) => {
    if (selectedOccasions.includes(occasion)) {
      setSelectedOccasions(selectedOccasions.filter((o) => o !== occasion));
    } else {
      setSelectedOccasions([...selectedOccasions, occasion]);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      submitProfile();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    router.replace('/(tabs)');
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.put(
        '/users/profile',
        {
          gender: selectedGender,
          preferred_styles: selectedStyles,
          favorite_colors: selectedColors,
          occasion_preferences: selectedOccasions,
        },
        token!
      );
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      showToast({ message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicators = () => (
    <View style={styles.stepIndicators}>
      {[1, 2, 3, 4].map((s) => (
        <View
          key={s}
          style={[styles.stepIndicator, step >= s ? styles.stepIndicatorActive : null]}
        />
      ))}
    </View>
  );

  const StepWrapper = ({ children, stepKey }: { children: React.ReactNode; stepKey: number }) => (
    <MotiView
      key={stepKey}
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -20 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.stepContent}
    >
      {children}
    </MotiView>
  );

  const renderStep1 = () => (
    <StepWrapper stepKey={1}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Let's personalize your experience. How do you identify?</Text>

      <View style={styles.optionsList}>
        {[
          { id: 'male', label: 'Male' },
          { id: 'female', label: 'Female' },
          { id: 'non-binary', label: 'Non-binary' },
          { id: 'prefer-not-to-say', label: 'Prefer not to say' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedGender === option.id && styles.optionCardActive,
            ]}
            onPress={() => setSelectedGender(option.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedGender === option.id && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
            {selectedGender === option.id && (
              <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </StepWrapper>
  );

  const renderStep2 = () => (
    <StepWrapper stepKey={2}>
      <Text style={styles.title}>Your Style</Text>
      <Text style={styles.subtitle}>Select up to 3 styles that best describe your wardrobe.</Text>

      <View style={styles.chipGrid}>
        {STYLE_OPTIONS.map((style) => {
          const isSelected = selectedStyles.includes(style);
          return (
            <TouchableOpacity
              key={style}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => {
                if (!isSelected && selectedStyles.length >= 3) return;
                handleToggleStyle(style);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {style}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StepWrapper>
  );

  const renderStep3 = () => (
    <StepWrapper stepKey={3}>
      <Text style={styles.title}>Colors</Text>
      <Text style={styles.subtitle}>What colors do you wear most often? Select up to 3.</Text>

      <View style={styles.chipGrid}>
        {COLOR_OPTIONS.map((color) => {
          const isSelected = selectedColors.includes(color);
          return (
            <TouchableOpacity
              key={color}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => {
                if (!isSelected && selectedColors.length >= 3) return;
                handleToggleColor(color);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {color}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StepWrapper>
  );

  const renderStep4 = () => (
    <StepWrapper stepKey={4}>
      <Text style={styles.title}>Occasions</Text>
      <Text style={styles.subtitle}>What occasions do you usually dress for? Select up to 3.</Text>

      <View style={styles.chipGrid}>
        {Object.entries(OCCASION_LABELS).map(([key, label]) => {
          const isSelected = selectedOccasions.includes(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, isSelected && styles.chipActive]}
              onPress={() => {
                if (!isSelected && selectedOccasions.length >= 3) return;
                handleToggleOccasion(key);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </StepWrapper>
  );

  const canProceed = () => {
    if (step === 1) return selectedGender !== null;
    if (step === 2) return selectedStyles.length > 0;
    if (step === 3) return selectedColors.length > 0;
    if (step === 4) return selectedOccasions.length > 0;
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {renderStepIndicators()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AnimatePresence exitBeforeEnter>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </AnimatePresence>
      </ScrollView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 200 }}
        style={[styles.footer, { paddingBottom: insets.bottom || Spacing.xl }]}
      >
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.textInverse} size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              {step === 4 ? 'Complete Profile' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </MotiView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButtonPlaceholder: { width: 44, height: 44 },
  skipText: {
    fontSize: Typography.base,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  stepIndicators: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  stepIndicator: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  stepIndicatorActive: {
    backgroundColor: Colors.graphite,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  stepContent: { flex: 1 },
  title: {
    fontSize: Typography['3xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
    letterSpacing: Typography.tracking.normal,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.md,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginBottom: Spacing['3xl'],
    lineHeight: Typography.md * Typography.lineHeight.relaxed,
  },
  optionsList: { gap: Spacing.md },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  optionCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  optionText: {
    fontSize: Typography.lg,
    fontFamily: 'Inter_500Medium',
    color: Colors.textPrimary,
  },
  optionTextActive: {
    color: Colors.accent,
    fontFamily: 'Inter_600SemiBold',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  chipActive: {
    backgroundColor: Colors.graphite,
    borderColor: Colors.graphite,
  },
  chipText: {
    fontSize: Typography.base,
    fontFamily: 'Inter_500Medium',
    color: Colors.textPrimary,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.bg,
  },
  nextButton: {
    backgroundColor: Colors.graphite,
    borderRadius: Radius.lg,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.bgTertiary,
    opacity: 0.8,
    shadowOpacity: 0,
  },
  nextButtonText: {
    fontSize: Typography.lg,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
  },
});
