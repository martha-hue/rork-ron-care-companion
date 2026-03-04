import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';
import { CarerRole } from '@/constants/types';

const ROLE_COLORS: Record<CarerRole, string> = {
  'Family': Colors.carerFamily,
  'Care-Team': Colors.carerCareTeam,
  'Private Carer': Colors.carerPrivate,
  'Friend': Colors.carerFriend,
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { carers, login } = useCarer();

  const handleLogin = (index: number) => {
    const carer = carers[index];
    login(carer);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.logoArea}>
          <Image
            source={require('@/assets/images/ron-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>RON</Text>
          <Text style={styles.tagline}>Care Diary</Text>
        </View>

        <Text style={styles.prompt}>Who{"'"}s logging in?</Text>

        <View style={styles.carerList}>
          {carers.map((carer, index) => (
            <TouchableOpacity
              key={carer.id}
              style={styles.carerCard}
              onPress={() => handleLogin(index)}
              activeOpacity={0.7}
              testID={`login-carer-${carer.id}`}
            >
              <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[carer.role] + '20' }]}>
                <User color={ROLE_COLORS[carer.role]} size={24} />
              </View>
              <View style={styles.carerInfo}>
                <Text style={styles.carerName}>{carer.name}</Text>
                <Text style={styles.carerRole}>{carer.role}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0',
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  carerList: {
    gap: 12,
  },
  carerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(192, 104, 48, 0.06)',
      },
    }),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carerInfo: {
    flex: 1,
  },
  carerName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  carerRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
