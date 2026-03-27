import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';

export default function PatientDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { savePatient } = useCarer();

  const [patientFirstName, setPatientFirstName] = useState<string>('');
  const [patientLastName, setPatientLastName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const totalSteps = 5;
  const currentStep = 3;

  const formatDobInput = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length > 2) formatted += '/' + cleaned.slice(2, 4);
    if (cleaned.length > 4) formatted += '/' + cleaned.slice(4, 8);
    setDob(formatted);
  };

  const handleContinue = () => {
    if (!patientFirstName.trim() || !patientLastName.trim()) {
      Alert.alert('Missing Information', "Please enter the patient\'s name.");
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    savePatient({
      firstName: patientFirstName.trim(),
      lastName: patientLastName.trim(),
      dateOfBirth: dob,
      notes: notes.trim() || undefined,
    });

    router.push('/invite-team');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.heading}>Who are you caring for?</Text>
          <Text style={styles.subheading}>
            This person will be at the heart of your shared care hub.
          </Text>

          <View style={styles.illustrationArea}>
            <View style={styles.illustrationCircle}>
              <Heart color={Colors.primary} size={36} fill={Colors.primary + '30'} />
            </View>
          </View>

          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient{"'"}s First Name</Text>
              <TextInput
                style={styles.input}
                value={patientFirstName}
                onChangeText={setPatientFirstName}
                placeholder="e.g. Ron"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                testID="patient-firstname"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Patient{"'"}s Last Name</Text>
              <TextInput
                style={styles.input}
                value={patientLastName}
                onChangeText={setPatientLastName}
                placeholder="e.g. Brooks"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                testID="patient-lastname"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={dob}
                onChangeText={formatDobInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={Colors.textLight}
                keyboardType="number-pad"
                maxLength={10}
                testID="patient-dob"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything the team should know..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                testID="patient-notes"
              />
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          testID="patient-continue"
        >
          <Text style={styles.continueBtnText}>
            Create {patientFirstName.trim() || "Patient"}{"'"}s Profile
          </Text>
          <ArrowRight color={Colors.white} size={20} />
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  illustrationArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  illustrationCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formArea: {
    gap: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
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
