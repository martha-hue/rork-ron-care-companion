import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  MessageSquare,
  Mail,
  Link2,
  Plus,
  X,
  ArrowRight,
  Send,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';

interface Invitee {
  id: string;
  name: string;
  contact: string;
}

export default function InviteTeamScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patient, completeOnboarding } = useCarer();

  const [invitees, setInvitees] = useState<Invitee[]>([
    { id: '1', name: '', contact: '' },
  ]);

  const totalSteps = 5;
  const currentStep = 4;

  const patientName = patient?.firstName ?? 'your loved one';

  const addInvitee = () => {
    setInvitees([...invitees, { id: Date.now().toString(), name: '', contact: '' }]);
  };

  const removeInvitee = (id: string) => {
    if (invitees.length === 1) return;
    setInvitees(invitees.filter((i) => i.id !== id));
  };

  const updateInvitee = (id: string, field: 'name' | 'contact', value: string) => {
    setInvitees(invitees.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const inviteMessage = `Hi! I'm using Ron Care Companion to coordinate care for ${patientName}. It's a shared care diary for the whole team — shifts, medication logs, notes and weekly reviews. Download it from the App Store and we can all stay in sync.`;

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await Share.share({ message: inviteMessage });
    } catch {
      // user dismissed share sheet
    }
  };

  const handleSendInvites = async () => {
    const validInvitees = invitees.filter((i) => i.name.trim() && i.contact.trim());
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (validInvitees.length > 0) {
      try {
        await Share.share({
          message: `Hi ${validInvitees.map((i) => i.name).join(', ')}! ${inviteMessage}`,
        });
      } catch {
        // user dismissed
      }
    }
    finishOnboarding();
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const finishOnboarding = () => {
    completeOnboarding();
    router.dismissAll();
    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Invite Your Team</Text>
        <Text style={styles.subheading}>
          Add people who help care for {patientName}. They{"'"}ll get a personal link to join.
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleShare} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '15' }]}>
              <Link2 color={Colors.primary} size={20} />
            </View>
            <Text style={styles.quickActionLabel}>Share Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleShare} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.success + '15' }]}>
              <MessageSquare color={Colors.success} size={20} />
            </View>
            <Text style={styles.quickActionLabel}>SMS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleShare} activeOpacity={0.7}>
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.accent + '15' }]}>
              <Mail color={Colors.accent} size={20} />
            </View>
            <Text style={styles.quickActionLabel}>Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or add people directly</Text>
          <View style={styles.dividerLine} />
        </View>

        {invitees.map((invitee, index) => (
          <View key={invitee.id} style={styles.inviteeCard}>
            <View style={styles.inviteeHeader}>
              <Text style={styles.inviteeLabel}>Person {index + 1}</Text>
              {invitees.length > 1 && (
                <TouchableOpacity onPress={() => removeInvitee(invitee.id)}>
                  <X color={Colors.textLight} size={18} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.inviteeInput}
              value={invitee.name}
              onChangeText={(v) => updateInvitee(invitee.id, 'name', v)}
              placeholder="Name"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.inviteeInput}
              value={invitee.contact}
              onChangeText={(v) => updateInvitee(invitee.id, 'contact', v)}
              placeholder="Phone or email"
              placeholderTextColor={Colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addInvitee} activeOpacity={0.7}>
          <Plus color={Colors.primary} size={18} />
          <Text style={styles.addBtnText}>Add Another Person</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendInvites}
          activeOpacity={0.85}
          testID="send-invites"
        >
          <Send color={Colors.white} size={20} />
          <Text style={styles.sendBtnText}>Send Invites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
          <ArrowRight color={Colors.textSecondary} size={16} />
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  scrollContent: {
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 28,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 28,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  inviteeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  inviteeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteeLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  inviteeInput: {
    backgroundColor: Colors.cream,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 12,
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bottomButtons: {
    gap: 10,
  },
  sendBtn: {
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
  sendBtnText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  skipBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
