import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/services/apiClient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { STYLE_OPTIONS, COLOR_OPTIONS, OCCASION_LABELS } from '@fitcheck/shared';
import { useToast } from '../../src/components/ui/Toast';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, token, updateUser } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(user?.preferredStyles || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(user?.favoriteColors || []);

  const handleToggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      if (selectedStyles.length >= 3) return;
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleToggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((c) => c !== color));
    } else {
      if (selectedColors.length >= 3) return;
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const res = await apiClient.put<{ success: boolean; data: { user: any } }>(
        '/users/profile',
        {
          name,
          bio,
          preferredStyles: selectedStyles,
          favoriteColors: selectedColors,
        },
        token
      );

      // Update global store and React Query cache
      updateUser(res.data.user);
      queryClient.setQueryData(['profile'], { success: true, data: { user: res.data.user } });

      showToast({ message: 'Profile updated successfully', type: 'success' });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      showToast({ message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <MotiView from={{ opacity: 0, translateX: -10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
        </MotiView>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <MotiView from={{ opacity: 0, translateX: 10 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
          <TouchableOpacity style={styles.iconButton} onPress={handleSave} disabled={isSubmitting} activeOpacity={0.8}>
            {isSubmitting ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </MotiView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={Colors.textMuted}
                selectionColor={Colors.accent}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="A little about yourself..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                selectionColor={Colors.accent}
              />
            </View>
          </View>
        </MotiView>

        {/* Style Preferences */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Style Preferences (Max 3)</Text>
          <View style={styles.chipGrid}>
            {STYLE_OPTIONS.map((style) => {
              const isSelected = selectedStyles.includes(style);
              return (
                <TouchableOpacity
                  key={style}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => handleToggleStyle(style)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>

        {/* Color Preferences */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Favorite Colors (Max 3)</Text>
          <View style={styles.chipGrid}>
            {COLOR_OPTIONS.map((color) => {
              const isSelected = selectedColors.includes(color);
              return (
                <TouchableOpacity
                  key={color}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => handleToggleColor(color)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>
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
    paddingBottom: Spacing.md,
    backgroundColor: Colors.bg,
  },
  headerTitle: { fontSize: Typography.xl, fontFamily: 'PlayfairDisplay_600SemiBold', color: Colors.textPrimary },
  iconButton: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
  saveText: { fontSize: Typography.base, fontFamily: 'Inter_600SemiBold', color: Colors.accent },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing['4xl'] },
  section: { marginBottom: Spacing['3xl'] },
  sectionTitle: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    letterSpacing: Typography.tracking.widest,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.sm, fontFamily: 'Inter_500Medium', color: Colors.textPrimary, marginBottom: Spacing.xs },
  inputWrapper: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  textInput: {
    height: 56,
    fontSize: Typography.base,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  textArea: { height: 120, paddingTop: Spacing.md },
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
});
