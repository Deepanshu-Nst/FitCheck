import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

import { useAuthStore } from '../../src/store/authStore';
import { SignupInputSchema, type SignupInput } from '@fitcheck/shared';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useToast } from '../../src/components/ui/Toast';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupInputSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await signup(data);
      router.replace('/(auth)/onboarding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      showToast({ message, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing['2xl'] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 400 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 100 }}
          style={styles.titleBlock}
        >
          <Text style={styles.title}>Join FitCheck</Text>
          <Text style={styles.subtitle}>Begin your AI-powered style journey today.</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 200 }}
          style={styles.form}
        >
          {/* Name */}
          <FormField label="Full Name" error={errors.name?.message}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <InputWrapper hasError={!!errors.name}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Your full name"
                    autoCapitalize="words"
                  />
                </InputWrapper>
              )}
            />
          </FormField>

          {/* Email */}
          <FormField label="Email Address" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <InputWrapper hasError={!!errors.email}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </InputWrapper>
              )}
            />
          </FormField>

          {/* Password */}
          <FormField label="Password" error={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <InputWrapper hasError={!!errors.password}>
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Min. 8 characters"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </InputWrapper>
              )}
            />
          </FormField>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.submitText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 800, delay: 400 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function InputWrapper({
  hasError,
  children,
}: {
  hasError?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.inputWrapper, hasError && styles.inputError]}>
      {children}
    </View>
  );
}

function StyledInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor={Colors.textMuted}
      selectionColor={Colors.accent}
      style={styles.textInput}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing['xl'] },
  backButton: {
    width: 44, height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing['3xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  titleBlock: { marginBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography['3xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.lineHeight.relaxed,
  },
  form: { gap: Spacing.lg },
  fieldGroup: { marginBottom: Spacing.sm },
  label: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputError: { borderWidth: 1, borderColor: Colors.error, backgroundColor: Colors.errorMuted },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  eyeButton: { padding: Spacing.xs, marginLeft: Spacing.sm },
  errorText: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_400Regular',
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  submitButton: {
    backgroundColor: Colors.graphite,
    borderRadius: Radius.lg,
    height: 56,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.xl,
    ...Shadow.md,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: Typography.md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
    letterSpacing: Typography.tracking.wide,
  },
  terms: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: Typography.xs * Typography.lineHeight.relaxed,
  },
  termsLink: { color: Colors.accent, fontFamily: 'Inter_500Medium' },
  footer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 'auto',
    paddingTop: Spacing['3xl'],
  },
  footerText: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.accent,
  },
});
