import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { MotiView } from 'moti';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/services/apiClient';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import type { User } from '@fitcheck/shared';
import { useToast } from '../../src/components/ui/Toast';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';
import { AnimatedButton } from '../../src/components/ui/AnimatedButton';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, token, logout } = useAuthStore();
  const { showToast } = useToast();

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: { user: User } }>('/users/profile', token!),
    enabled: !!token,
    initialData: user ? { success: true, data: { user } } : undefined,
  });

  const profile = profileData?.data.user;

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!profile) return null;

  return (
    <ScreenContainer padBottom={false}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, { paddingTop: Spacing.xl, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.profileHeader}
        >
        <View style={styles.avatarContainer}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>{(profile.name?.[0] || 'U').toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        {profile.username && <Text style={styles.username}>@{profile.username}</Text>}
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        <AnimatedButton
          label="Edit Profile"
          variant="secondary"
          onPress={() => router.push('/profile/edit' as never)}
          containerStyle={{ marginTop: Spacing.xl }}
          style={{ height: 40, paddingHorizontal: Spacing.xl, borderRadius: Radius.full }}
        />
      </MotiView>

      {/* ── Style Preferences ── */}
      {profile.preferredStyles && profile.preferredStyles.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
        >
          <PreferenceSection title="Style Vibe">
            {profile.preferredStyles.map((style: string) => (
              <Chip key={style} label={style} />
            ))}
          </PreferenceSection>
        </MotiView>
      )}

      {/* ── Color Preferences ── */}
      {profile.favoriteColors && profile.favoriteColors.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
        >
          <PreferenceSection title="Favorite Colors">
            {profile.favoriteColors.map((color: string) => (
              <Chip key={color} label={color} />
            ))}
          </PreferenceSection>
        </MotiView>
      )}

      {/* ── Account Info ── */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 300 }}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.cardGroup}>
          <InfoRow icon="mail-outline" label="Email" value={profile.email} isFirst />
          <InfoRow
            icon="calendar-outline"
            label="Member since"
            value={new Date(profile.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
            isLast
          />
        </View>
      </MotiView>

      {/* ── Actions ── */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 400 }}
        style={styles.section}
      >
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.cardGroup}>
          <ActionRow icon="notifications-outline" label="Settings & Notifications" onPress={() => router.push('/profile/settings')} isFirst />
          <ActionRow icon="shield-outline" label="Privacy" onPress={() => showToast({ message: 'Privacy policy coming soon' })} />
          <ActionRow icon="help-circle-outline" label="Help & Support" onPress={() => showToast({ message: 'Help center coming soon' })} />
          <ActionRow
            icon="log-out-outline"
            label="Log out"
            onPress={handleLogout}
            destructive
            isLast
          />
        </View>
      </MotiView>
      </ScrollView>
    </ScreenContainer>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function PreferenceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value, isFirst, isLast }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.infoRow, !isLast && styles.rowBorder]}>
      <Ionicons name={icon} size={20} color={Colors.textSecondary} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionRow({ icon, label, onPress, destructive = false, isFirst, isLast }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.actionRow, !isLast && styles.rowBorder]} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={destructive ? Colors.error : Colors.textSecondary} />
      <Text style={[styles.actionLabel, destructive && styles.destructiveText]}>{label}</Text>
      {!destructive && <Ionicons name="chevron-forward" size={16} color={Colors.border} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl },
  profileHeader: { alignItems: 'center', marginBottom: Spacing['3xl'], paddingTop: Spacing.xl },
  avatarContainer: {
    ...Shadow.sm,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.bgCard,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: Typography['3xl'], fontFamily: 'PlayfairDisplay_700Bold', color: Colors.accent },
  name: { fontSize: Typography['2xl'], fontFamily: 'PlayfairDisplay_700Bold', color: Colors.textPrimary, marginBottom: 2 },
  username: { fontSize: Typography.sm, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, textTransform: 'lowercase' },
  bio: {
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
    paddingHorizontal: Spacing.xl,
  },
  editButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: { fontSize: Typography.sm, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    letterSpacing: Typography.tracking.widest,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
    marginLeft: Spacing.sm,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  chipText: { fontSize: Typography.sm, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  cardGroup: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: Typography.xs, fontFamily: 'Inter_500Medium', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: Typography.tracking.wide },
  infoValue: { fontSize: Typography.base, fontFamily: 'Inter_400Regular', color: Colors.textPrimary, marginTop: 4 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  actionLabel: { flex: 1, fontSize: Typography.base, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  destructiveText: { color: Colors.error },
});
