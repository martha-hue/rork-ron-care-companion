import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Users, UserPlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';

const FLAT_BG = '#f5ede0';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { markTeamStarter } = useCarer();

  const [showSplash, setShowSplash] = useState(true);
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(40)).current;
  const splashFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('[Splash] Starting heartbeat animation');

    const heartbeat = Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.15,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.97,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1.12,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    const startTimer = setTimeout(() => {
      heartbeat.start(() => {
        console.log('[Splash] Heartbeat animation complete');
      });
    }, 200);

    const fadeTimer = setTimeout(() => {
      Animated.timing(splashFade, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        Animated.parallel([
          Animated.timing(fadeIn, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(buttonsSlide, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 2500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  const handleStartTeam = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    markTeamStarter(true);
    router.push('/signup');
  };

  const handleJoinTeam = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    markTeamStarter(false);
    router.push('/signup');
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={{
            transform: [{ scale: logoScale }],
            opacity: splashFade,
            alignItems: 'center',
          }}
        >
          <Image
            source={require('@/assets/images/ron-logo.png')}
            style={styles.splashLogo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/ron-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.taglineBlock}>
          <Text style={styles.taglineLine1}>Shared Care</Text>
          <Text style={styles.taglineLine2}>MADE SIMPLE</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeIn,
            transform: [{ translateY: buttonsSlide }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleStartTeam}
          activeOpacity={0.85}
          testID="start-team-button"
        >
          <Users color={Colors.white} size={22} />
          <Text style={styles.primaryBtnText}>Start a Care Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={handleJoinTeam}
          activeOpacity={0.85}
          testID="join-team-button"
        >
          <UserPlus color={Colors.white} size={22} />
          <Text style={styles.secondaryBtnText}>Join a Team</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: FLAT_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 100,
    height: 100,
  },
  splashTextBlock: {
    alignItems: 'center',
    marginTop: 16,
    gap: 2,
  },
  splashLine1: {
    fontSize: 26,
    color: '#c4533a',
    fontFamily: 'Georgia',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  splashLine2: {
    fontSize: 14,
    color: '#d4755f',
    fontFamily: 'Georgia',
    fontWeight: '400' as const,
    letterSpacing: 4,
  },
  container: {
    flex: 1,
    backgroundColor: FLAT_BG,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoContainer: {
    marginBottom: 12,
    backgroundColor: '#f5ede0',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    opacity: 1,
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  taglineBlock: {
    alignItems: 'center',
    marginTop: 16,
    gap: 2,
  },
  taglineLine1: {
    fontSize: 26,
    color: '#c4533a',
    fontFamily: 'Georgia',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  taglineLine2: {
    fontSize: 14,
    color: '#d4755f',
    fontFamily: 'Georgia',
    fontWeight: '400' as const,
    letterSpacing: 4,
  },
  bottomSection: {
    gap: 14,
    paddingBottom: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#c4533a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(196, 83, 58, 0.25)',
      },
    }),
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  secondaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  secondaryBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
