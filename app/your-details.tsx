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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Camera, ArrowRight, ChevronDown, Pencil } from 'lucide-react-native';
import { showPhotoPicker } from '@/utils/photoPicker';
import Colors from '@/constants/colors';
import { useCarer } from '@/providers/CarerProvider';
import { CarerRelation, RELATION_TO_ROLE } from '@/constants/types';

const RELATIONS: CarerRelation[] = [
  'Son', 'Daughter', 'Spouse', 'Sibling', 'Friend', 'Care-Team', 'Private Carer', 'Other',
];

export default function YourDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isTeamStarter, login } = useCarer();

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [relation, setRelation] = useState<CarerRelation | null>(null);
  const [otherRelation, setOtherRelation] = useState<string>('');
  const [showRelationPicker, setShowRelationPicker] = useState<boolean>(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const totalSteps = isTeamStarter ? 5 : 3;
  const currentStep = 2;

  const handleContinue = () => {
    if (!firstName.trim() || !lastName.trim() || !relation) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    if (relation === 'Other' && !otherRelation.trim()) {
      Alert.alert('Missing Information', 'Please specify your relation.');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const role = RELATION_TO_ROLE[relation];
    const carer = {
      id: Date.now().toString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: firstName.trim(),
      role,
      relation,
      isTeamStarter,
      ...(avatarUri ? { avatar: avatarUri } : {}),
    };

    login(carer);

    if (isTeamStarter) {
      router.push('/patient-details');
    } else {
      router.push('/join-complete');
    }
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
          <Text style={styles.heading}>Your Details</Text>
          <Text style={styles.subheading}>
            Tell us a bit about yourself. This info appears on every entry you make.
          </Text>

          <TouchableOpacity
            style={styles.avatarUpload}
            activeOpacity={0.7}
            testID="avatar-upload"
            onPress={() => {
              showPhotoPicker((result) => {
                setAvatarUri(result.uri);
                console.log('[YourDetails] Avatar set:', result.uri);
              });
            }}
          >
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Camera color={Colors.textLight} size={28} />
              )}
              {avatarUri && (
                <View style={styles.avatarEditBadge}>
                  <Pencil color={Colors.white} size={12} />
                </View>
              )}
            </View>
            <Text style={styles.avatarText}>{avatarUri ? 'Change Photo' : 'Add Photo (optional)'}</Text>
          </TouchableOpacity>

          <View style={styles.formArea}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your first name"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                testID="details-firstname"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Your last name"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                testID="details-lastname"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Role / Relation to Patient</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => setShowRelationPicker(!showRelationPicker)}
                testID="relation-picker"
              >
                <Text style={[styles.selectText, !relation && styles.selectPlaceholder]}>
                  {relation ?? 'Select your relation'}
                </Text>
                <ChevronDown color={Colors.textSecondary} size={20} />
              </TouchableOpacity>

              {showRelationPicker && (
                <View style={styles.pickerDropdown}>
                  {RELATIONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.pickerOption, relation === r && styles.pickerOptionActive]}
                      onPress={() => {
                        setRelation(r);
                        setShowRelationPicker(false);
                        if (Platform.OS !== 'web') {
                          Haptics.selectionAsync();
                        }
                      }}
                    >
                      <Text
                        style={[styles.pickerOptionText, relation === r && styles.pickerOptionTextActive]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {relation === 'Other' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Please Specify</Text>
                <TextInput
                  style={styles.input}
                  value={otherRelation}
                  onChangeText={setOtherRelation}
                  placeholder="e.g. Neighbour, Volunteer"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                  testID="details-other-relation"
                />
              </View>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
          testID="details-continue"
        >
          <Text style={styles.continueBtnText}>Continue</Text>
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
    marginBottom: 28,
  },
  avatarUpload: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.creamDark,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  avatarText: {
    fontSize: 15,
    color: Colors.textSecondary,
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
  selectBtn: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  selectText: {
    fontSize: 17,
    color: Colors.text,
  },
  selectPlaceholder: {
    color: Colors.textLight,
  },
  pickerDropdown: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  pickerOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary + '10',
  },
  pickerOptionText: {
    fontSize: 17,
    color: Colors.text,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
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
