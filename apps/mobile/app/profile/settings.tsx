import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../src/constants/theme';
import { useToast } from '../../src/components/ui/Toast';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [notifications, setNotifications] = React.useState(true);
  const [marketing, setMarketing] = React.useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 10 }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Push Notifications</Text>
                <Text style={styles.rowSubtitle}>Receive feedback alerts</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.surface, true: Colors.gold }}
              />
            </View>
            <View style={[styles.row, styles.noBorder]}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Marketing Emails</Text>
                <Text style={styles.rowSubtitle}>Tips, tricks, and offers</Text>
              </View>
              <Switch
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{ false: Colors.surface, true: Colors.gold }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} onPress={() => showToast({ message: 'Support center coming soon' })}>
              <Text style={styles.actionText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, styles.noBorder]} onPress={() => showToast({ message: 'Report issue coming soon' })}>
              <Text style={styles.actionText}>Report an Issue</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  iconButton: { width: 40, height: 40, justifyContent: 'center' },
  content: { padding: Spacing.md, paddingBottom: Spacing['4xl'] },
  section: { marginBottom: Spacing['2xl'] },
  sectionTitle: {
    fontSize: Typography.xs,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
    letterSpacing: Typography.tracking.widest,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: Typography.base, fontFamily: 'Inter_500Medium', color: Colors.textPrimary, marginBottom: 2 },
  rowSubtitle: { fontSize: Typography.xs, fontFamily: 'Inter_400Regular', color: Colors.textSecondary },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: { fontSize: Typography.base, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  noBorder: { borderBottomWidth: 0 },
});
