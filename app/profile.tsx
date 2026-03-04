import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { User, LogOut, Camera, Pencil } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';
import { CarerRole } from '@/constants/types';
import { showPhotoPicker } from '@/utils/photoPicker';

const ROLE_COLORS: Record<CarerRole, string> = {
  'Family': Colors.carerFamily,
  'Care-Team': Colors.carerCareTeam,
  'Private Carer': Colors.carerPrivate,
  'Friend': Colors.carerFriend,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { currentCarer, logout, updateAvatar } = useCarer();

  const handleLogout = () => {
    logout();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.back();
  };

  if (!currentCarer) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Not logged in</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/login'), 300);
          }}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleColor = ROLE_COLORS[currentCarer.role];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.profileArea}>
        <TouchableOpacity
          style={[styles.avatarLarge, { backgroundColor: roleColor + '20' }]}
          activeOpacity={0.7}
          testID="profile-avatar-upload"
          onPress={() => {
            showPhotoPicker((result) => {
              updateAvatar(result.uri);
              console.log('[Profile] Avatar updated:', result.uri);
            });
          }}
        >
          {currentCarer.avatar ? (
            <Image source={{ uri: currentCarer.avatar }} style={styles.avatarImage} />
          ) : (
            <User color={roleColor} size={48} />
          )}
          <View style={styles.avatarEditBadge}>
            {currentCarer.avatar ? (
              <Pencil color={Colors.white} size={12} />
            ) : (
              <Camera color={Colors.white} size={12} />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{currentCarer.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '15' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{currentCarer.role}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Your entries are automatically tagged with:</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Name</Text>
          <Text style={styles.infoValue}>{currentCarer.name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Role</Text>
          <Text style={styles.infoValue}>{currentCarer.role}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
        testID="logout-button"
      >
        <LogOut color={Colors.warmRed} size={20} />
        <Text style={styles.logoutText}>Switch Carer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    padding: 24,
  },
  profileArea: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  infoCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
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
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoKey: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.warmRed + '10',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.warmRed + '30',
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.warmRed,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
