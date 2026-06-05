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
import { MotiView, MotiText } from 'moti';

import { useAuthStore } from '../../src/store/authStore';
import { LoginInputSchema, type LoginInput } from '@fitcheck/shared';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useToast } from '../../src/components/ui/Toast';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      showToast({ message, type: 'error' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing['5xl'], paddingBottom: insets.bottom + Spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 100 }}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>ƒ.</Text>
          </View>
          <Text style={styles.brandName}>FitCheck</Text>
          <Text style={styles.brandTagline}>by stylicaa</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 200 }}
          style={styles.titleBlock}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your details to access your personal AI stylist.</Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, delay: 300 }}
          style={styles.form}
        >
          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={Colors.accent}
                  />
                </View>
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={onChange}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    selectionColor={Colors.accent}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <Text style={styles.submitText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 800, delay: 500 }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>New to FitCheck? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </Link>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing['xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoIcon: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.accent,
  },
  brandName: {
    fontSize: Typography['2xl'],
    fontFamily: 'PlayfairDisplay_600SemiBold',
    color: Colors.textPrimary,
    letterSpacing: Typography.tracking.tight,
  },
  brandTagline: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    letterSpacing: Typography.tracking.widest,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  titleBlock: {
    marginBottom: Spacing['3xl'],
  },
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
  form: {
    gap: Spacing.lg,
  },
  fieldGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: Typography.tracking.wide,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    height: 56,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorMuted,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    ...Shadow.md,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: Typography.md,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textInverse,
    letterSpacing: Typography.tracking.wide,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
