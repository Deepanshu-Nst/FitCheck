import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Colors, Radius, Shadow } from '../../src/constants/theme';
import { useUploadStore } from '../../src/store/uploadStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PreviewScreen() {
  const insets = useSafeAreaInsets();
  const { uri, mimeType } = useLocalSearchParams<{ uri: string; mimeType: string }>();
  const { setImage } = useUploadStore();

  const handleNext = () => {
    if (uri && mimeType) {
      setImage(uri, mimeType);
      router.replace('/upload/occasion');
    }
  };

  if (!uri) return null;

  return (
    <View style={styles.root}>
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400 }}
        style={StyleSheet.absoluteFill}
      >
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </MotiView>

      {/* Top Bar Overlay */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
        style={[styles.topBar, { top: insets.top + 16 }]}
      >
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </MotiView>

      {/* Bottom Bar Overlay */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 300 }}
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 40 }]}
      >
        <NextButton onPress={handleNext} />
      </MotiView>
    </View>
  );
}

function NextButton({ onPress }: { onPress: () => void }) {
  const [isPressed, setIsPressed] = React.useState(false);
  return (
    <MotiView
      animate={{ scale: isPressed ? 0.9 : 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
    >
      <TouchableOpacity
        style={styles.nextButton}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Ionicons name="arrow-forward" size={32} color={Colors.textInverse} />
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  image: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  nextButton: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
