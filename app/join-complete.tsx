import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircle, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';

export default function JoinCompleteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentCarer, completeOnboarding } = useCarer();

  const checkScale = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.sequence([
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    completeOnboarding();
    router.dismissAll();
    router.replace('/');
  };

  const totalSteps = 3;
  const currentStep = 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < currentStep ? styles.progressDotActive : styles.progressDotInactive,
            ]}
          />
        ))}
      </View>

      <View style={styles.centerArea}>
        <Animated.View style={[styles.checkContainer, { transform: [{ scale: checkScale }] }]}>
          <View style={styles.checkCircle}>
            <CheckCircle color={Colors.white} size={48} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textArea, { opacity: fadeIn }]}>
          <Text style={styles.heading}>You{"'"}re all set!</Text>
          <Text style={styles.subheading}>
            Welcome{currentCarer ? `, ${currentCarer.name}` : ''}. You{"'"}ve joined the care team and are ready to start contributing.
          </Text>
          <Text style={styles.detail}>
            Everything you log will automatically include your name and role so the whole team stays informed.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fadeIn }}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          testID="join-complete-continue"
        >
          <Text style={styles.continueBtnText}>Go to Care Hub</Text>
          <ArrowRight color={Colors.white} size={20} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    height: 6,
    borderRadius: 3,
  },
  progressDotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  progressDotInactive: {
    width: 12,
    backgroundColor: Colors.divider,
  },
  centerArea: {
    alignItems: 'center',
  },
  checkContainer: {
    marginBottom: 28,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 6px 16px rgba(90, 158, 111, 0.3)',
      },
    }),
  },
  textArea: {
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 18,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detail: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(192, 104, 48, 0.25)',
      },
    }),
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
