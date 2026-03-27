import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ArrowRight, Heart, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isTeamStarter } = useCarer();

  const totalSteps = isTeamStarter ? 5 : 3;
  const currentStep = 1;

  const handleContinue = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/your-details');
  };

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

      <View style={styles.content}>
        <View style={styles.illustrationArea}>
          <View style={styles.iconCircle}>
            {isTeamStarter ? (
              <Users color={Colors.primary} size={40} />
            ) : (
              <Heart color={Colors.primary} size={40} fill={Colors.primary + '30'} />
            )}
          </View>
        </View>

        <Text style={styles.heading}>
          {isTeamStarter ? 'Start a Care Team' : 'Join a Care Team'}
        </Text>
        <Text style={styles.subheading}>
          {isTeamStarter
            ? "You're setting up a shared care hub. It takes about 2 minutes and everything stays on your device."
            : "You've been invited to join a care team. It takes about 1 minute to get set up."}
        </Text>

        <View style={styles.featureList}>
          {isTeamStarter ? (
            <>
              <FeatureRow text="Add your patient's details" />
              <FeatureRow text="Invite family and carers" />
              <FeatureRow text="Log shifts, meds and daily entries" />
              <FeatureRow text="Weekly team reviews" />
            </>
          ) : (
            <>
              <FeatureRow text="Add your name and role" />
              <FeatureRow text="See the team's shared diary" />
              <FeatureRow text="Log your own shifts and entries" />
            </>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueBtn}
        onPress={handleContinue}
        activeOpacity={0.85}
        testID="get-started-button"
      >
        <Text style={styles.continueBtnText}>Get Started</Text>
        <ArrowRight color={Colors.white} size={20} />
      </TouchableOpacity>

      <Text style={styles.privacyNote}>
        Your data stays on your device. Nothing is shared without your permission.
      </Text>
    </View>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    paddingHorizontal: 28,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 32,
    textAlign: 'center',
  },
  featureList: {
    gap: 14,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  featureText: {
    fontSize: 17,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
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
  privacyNote: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
