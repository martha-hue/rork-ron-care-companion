import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Pill,
  Moon,
  UtensilsCrossed,
  BedDouble,
  Footprints,
  Activity,
  Smile,
  Sun,
  AlertTriangle,
  AlertCircle,
  Stethoscope,
  FileText,
  Plus,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { LogType, LogEntry, LOG_TYPE_CATEGORY, LogCategory } from '@/constants/types';

const LOG_TYPES: { type: LogType; category: LogCategory }[] = [
  { type: 'Morning Meds', category: 'Medications' },
  { type: 'Afternoon Meds', category: 'Medications' },
  { type: 'Night Meds', category: 'Medications' },
  { type: 'As-Needed Meds', category: 'Medications' },
  { type: 'Meal', category: 'Meals' },
  { type: 'Nap', category: 'Activity' },
  { type: 'Walk', category: 'Activity' },
  { type: 'BM', category: 'Medical' },
  { type: 'Good Day', category: 'Activity' },
  { type: 'Clear Spell', category: 'Activity' },
  { type: 'Incident', category: 'Medical' },
  { type: 'Fall', category: 'Medical' },
  { type: 'Medical Appointment', category: 'Medical' },
  { type: 'Other', category: 'Activity' },
];

const CATEGORY_COLORS: Record<LogCategory, string> = {
  Medications: Colors.logMedication,
  Meals: Colors.logMeal,
  Medical: Colors.logMedical,
  Activity: Colors.logActivity,
};

function getIcon(logType: LogType, size: number, color: string) {
  switch (logType) {
    case 'Morning Meds':
    case 'Afternoon Meds':
    case 'As-Needed Meds':
      return <Pill size={size} color={color} />;
    case 'Night Meds':
      return <Moon size={size} color={color} />;
    case 'Meal':
      return <UtensilsCrossed size={size} color={color} />;
    case 'Nap':
      return <BedDouble size={size} color={color} />;
    case 'Walk':
      return <Footprints size={size} color={color} />;
    case 'BM':
      return <Activity size={size} color={color} />;
    case 'Good Day':
      return <Smile size={size} color={color} />;
    case 'Clear Spell':
      return <Sun size={size} color={color} />;
    case 'Incident':
      return <AlertTriangle size={size} color={color} />;
    case 'Fall':
      return <AlertCircle size={size} color={color} />;
    case 'Medical Appointment':
      return <Stethoscope size={size} color={color} />;
    case 'Other':
      return <FileText size={size} color={color} />;
    default:
      return <Plus size={size} color={color} />;
  }
}

export default function AddLogScreen() {
  const router = useRouter();
  const { addLog, getCurrentShift } = useCare();
  const { currentCarer } = useCarer();

  const [selectedType, setSelectedType] = useState<LogType | null>(null);
  const [notes, setNotes] = useState('');

  const currentShift = getCurrentShift();

  const handleSave = () => {
    if (!selectedType) {
      Alert.alert('Missing Info', 'Please select a log type.');
      return;
    }
    if (!currentCarer) {
      Alert.alert('Not Logged In', 'Please log in before adding entries.');
      return;
    }

    const entry: LogEntry = {
      id: `l_${Date.now()}`,
      timestamp: new Date().toISOString(),
      carerOnDuty: currentShift?.carerName ?? currentCarer.name,
      loggedBy: currentCarer.name,
      loggedByRole: currentCarer.role,
      logType: selectedType,
      notes: notes.trim() || undefined,
      category: LOG_TYPE_CATEGORY[selectedType],
    };

    addLog(entry);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const categories = ['Medications', 'Meals', 'Medical', 'Activity'] as const;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
        >
          {!currentCarer && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                Please log in first to attach your name to entries.
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.warningLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.instruction}>
            Tap the type of entry you want to log:
          </Text>

          {categories.map((cat) => {
            const catColor = CATEGORY_COLORS[cat];
            const typesInCat = LOG_TYPES.filter((lt) => lt.category === cat);

            return (
              <View key={cat} style={styles.categorySection}>
                <Text style={[styles.categoryLabel, { color: catColor }]}>{cat}</Text>
                <View style={styles.typeGrid}>
                  {typesInCat.map(({ type }) => {
                    const isSelected = selectedType === type;
                    return (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          isSelected && { backgroundColor: catColor, borderColor: catColor },
                        ]}
                        onPress={() => {
                          setSelectedType(type);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        {getIcon(type, 22, isSelected ? Colors.white : catColor)}
                        <Text
                          style={[
                            styles.typeLabel,
                            isSelected && { color: Colors.white },
                          ]}
                          numberOfLines={2}
                        >
                          {type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <Text style={styles.sectionTitle}>Notes (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any details..."
            placeholderTextColor={Colors.textLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="log-notes"
          />

          <TouchableOpacity
            style={[styles.saveButton, !selectedType && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!selectedType}
            testID="save-log"
          >
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </ScrollView>
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
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  warningBanner: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  warningLink: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 10,
  },
  instruction: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    flex: 1,
    maxWidth: '31%' as unknown as number,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 5,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  textArea: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
