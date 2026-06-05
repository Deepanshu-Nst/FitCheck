import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useToast } from '../../src/components/ui/Toast';
import { ScreenContainer } from '../../src/components/ui/ScreenContainer';

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async (source: 'library' | 'camera') => {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast({ message: 'Camera permission is required', type: 'error' });
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast({ message: 'Photo library permission is required', type: 'error' });
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Compress image to max 1200px wide, quality 0.85
      const compressed = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );

      router.push({
        pathname: '/upload/preview',
        params: { uri: compressed.uri, mimeType: 'image/jpeg' },
      });
    }
  };

  return (
    <ScreenContainer padBottom={false}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
        style={styles.header}
      >
        <Text style={styles.title}>Upload Look</Text>
        <Text style={styles.subtitle}>Let your AI stylist analyze your outfit</Text>
      </MotiView>

      {/* Upload Source Buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 100 }}
        style={styles.sourceGrid}
      >
        <SourceButton
          icon="camera-outline"
          label="Take Photo"
          onPress={() => pickImage('camera')}
          disabled={isUploading}
        />
        <SourceButton
          icon="images-outline"
          label="Photo Library"
          onPress={() => pickImage('library')}
          disabled={isUploading}
          primary
        />
      </MotiView>

      {/* Tips */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 200 }}
        style={styles.tipsCard}
      >
        <View style={styles.tipsHeader}>
          <Ionicons name="sparkles" size={20} color={Colors.accent} />
          <Text style={styles.tipsTitle}>Styling Tips</Text>
        </View>
        <View style={styles.tipsList}>
          {[
            'A full body shot works best for accurate feedback.',
            'Natural, well-lit environments improve AI analysis.',
            'Try to use a clean, uncluttered background.',
            'Ensure your entire outfit is visible in the frame.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </MotiView>
      </ScrollView>
    </ScreenContainer>
  );
}

function SourceButton({
  icon,
  label,
  onPress,
  primary = false,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <MotiView
      animate={{ scale: isPressed ? 0.95 : 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      style={{ flex: 1 }}
    >
      <TouchableOpacity
        style={[styles.sourceButton, primary && styles.sourceButtonPrimary, disabled && styles.disabled]}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <View style={[styles.sourceIcon, primary && styles.sourceIconPrimary]}>
          <Ionicons name={icon} size={32} color={primary ? Colors.textInverse : Colors.textSecondary} />
        </View>
        <Text style={[styles.sourceLabel, primary && styles.sourceLabelPrimary]}>{label}</Text>
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl },
  header: { marginBottom: Spacing['3xl'] },
  title: {
    fontSize: Typography['3xl'],
    fontFamily: 'PlayfairDisplay_700Bold',
    color: Colors.textPrimary,
    letterSpacing: Typography.tracking.tight,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.md,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  sourceGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing['3xl'] },
  sourceButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing['2xl'],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.lg,
    ...Shadow.sm,
  },
  sourceButtonPrimary: {
    backgroundColor: Colors.graphite,
    borderColor: Colors.graphite,
    ...Shadow.md,
  },
  sourceIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIconPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceLabel: {
    fontSize: Typography.base,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sourceLabelPrimary: {
    color: Colors.textInverse,
  },
  disabled: { opacity: 0.5 },
  tipsCard: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.lg,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  tipsList: {
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: Spacing.xl,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: Spacing.md,
    marginTop: 8,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.sm,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.lineHeight.relaxed,
  },
});
