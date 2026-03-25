import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { CarerRole, Shift } from '@/constants/types';
import { Clock } from 'lucide-react-native';

const ROLES: CarerRole[] = ['Family', 'Care-Team', 'Private Carer', 'Friend'];

function timeStringToDate(timeStr: string): Date {
  const d = new Date();
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(9, 0, 0, 0);
  }
  return d;
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function AddShiftScreen() {
  const router = useRouter();
  const { addShift } = useCare();
  const { carers } = useCarer();

  const [carerName, setCarerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<CarerRole | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [tempPickerDate, setTempPickerDate] = useState(new Date());

  const handleSave = () => {
    if (!carerName.trim()) {
      Alert.alert('Missing Info', 'Please enter the carer name.');
      return;
    }
    if (!selectedRole) {
      Alert.alert('Missing Info', 'Please select a role.');
      return;
    }
    if (!startTime || !endTime) {
      Alert.alert('Missing Info', 'Please select start and end times.');
      return;
    }
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    if (toMinutes(startTime) >= toMinutes(endTime)) {
      Alert.alert('Invalid Times', 'End time must be after start time.');
      return;
    }

    const shift: Shift = {
      id: `s_${Date.now()}`,
      carerId: carers.find((c) => c.name === carerName)?.id ?? `custom_${Date.now()}`,
      carerName: carerName.trim(),
      carerRole: selectedRole,
      date: selectedDate,
      startTime,
      endTime,
    };

    addShift(shift);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  const selectCarer = (name: string, role: CarerRole) => {
    setCarerName(name);
    setSelectedRole(role);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openStartPicker = () => {
    setTempPickerDate(timeStringToDate(startTime));
    setShowStartPicker(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const openEndPicker = () => {
    setTempPickerDate(timeStringToDate(endTime));
    setShowEndPicker(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const confirmStartTime = () => {
    setStartTime(formatTime(tempPickerDate));
    setShowStartPicker(false);
  };

  const confirmEndTime = () => {
    setEndTime(formatTime(tempPickerDate));
    setShowEndPicker(false);
  };

  const onPickerChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setTempPickerDate(selectedDate);
    }
  };

  const renderWebTimePicker = (
    value: string,
    onChange: (time: string) => void,
    label: string
  ) => (
    <View style={styles.webPickerContainer}>
      <TextInput
        style={styles.webTimeInput}
        value={value}
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9:]/g, '');
          onChange(cleaned);
        }}
        onBlur={() => {
          const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
          if (value && !match) {
            Alert.alert('Invalid Time', 'Please enter a valid time in HH:MM format (e.g. 09:00).');
          } else if (value && match) {
            const [h, m] = value.split(':');
            onChange(h.padStart(2, '0') + ':' + m.padStart(2, '0'));
          }
        }}
        placeholder="HH:MM"
        placeholderTextColor={Colors.textLight}
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        testID={`web-time-${label}`}
      />
    </View>
  );

  const renderTimePicker = (
    type: 'start' | 'end',
    value: string,
    showPicker: boolean,
    onOpen: () => void
  ) => {
    if (Platform.OS === 'web') {
      return renderWebTimePicker(
        value,
        type === 'start' ? setStartTime : setEndTime,
        type
      );
    }

    return (
      <TouchableOpacity
        style={styles.timeSelector}
        onPress={onOpen}
        activeOpacity={0.7}
        testID={`${type}-time-selector`}
      >
        <View style={styles.timeSelectorInner}>
          <Clock size={20} color={value ? Colors.primary : Colors.textLight} />
          <Text style={[styles.timeSelectorText, value ? styles.timeSelectorTextActive : null]}>
            {value || 'Tap to set time'}
          </Text>
        </View>
        {value ? (
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{value}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderPickerModal = (
    visible: boolean,
    onCancel: () => void,
    onConfirm: () => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={onCancel} style={styles.modalHeaderBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onConfirm} style={styles.modalHeaderBtn}>
                  <Text style={styles.modalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={tempPickerDate}
                  mode="time"
                  display="spinner"
                  onChange={onPickerChange}
                  minuteInterval={1}
                  is24Hour={true}
                  textColor={Colors.text}
                  style={styles.picker}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

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
          <Text style={styles.sectionTitle}>Quick Select Carer</Text>
          <View style={styles.carerGrid}>
            {carers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.carerChip,
                  carerName === c.name && styles.carerChipSelected,
                ]}
                onPress={() => selectCarer(c.name, c.role)}
              >
                <Text
                  style={[
                    styles.carerChipText,
                    carerName === c.name && styles.carerChipTextSelected,
                  ]}
                >
                  {c.name}
                </Text>
                <Text
                  style={[
                    styles.carerChipRole,
                    carerName === c.name && styles.carerChipRoleSelected,
                  ]}
                >
                  {c.role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Or Enter Manually</Text>
          <TextInput
            style={styles.input}
            placeholder="Carer name"
            placeholderTextColor={Colors.textLight}
            value={carerName}
            onChangeText={setCarerName}
            testID="shift-carer-name"
          />

          <Text style={styles.sectionTitle}>Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  selectedRole === role && styles.roleChipSelected,
                ]}
                onPress={() => {
                  setSelectedRole(role);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    selectedRole === role && styles.roleChipTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textLight}
            value={selectedDate}
            onChangeText={setSelectedDate}
            testID="shift-date"
          />

          <Text style={styles.sectionTitle}>Start Time</Text>
          {renderTimePicker('start', startTime, showStartPicker, openStartPicker)}

          <Text style={styles.sectionTitle}>End Time</Text>
          {renderTimePicker('end', endTime, showEndPicker, openEndPicker)}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            testID="save-shift"
          >
            <Text style={styles.saveButtonText}>Save Shift</Text>
          </TouchableOpacity>
        </ScrollView>

      {Platform.OS !== 'web' && renderPickerModal(
        showStartPicker,
        () => setShowStartPicker(false),
        confirmStartTime,
        'Set Start Time'
      )}
      {Platform.OS !== 'web' && renderPickerModal(
        showEndPicker,
        () => setShowEndPicker(false),
        confirmEndTime,
        'Set End Time'
      )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 14,
  },
  carerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  carerChip: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minWidth: '44%' as unknown as number,
    flex: 1,
  },
  carerChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  carerChipText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  carerChipTextSelected: {
    color: Colors.white,
  },
  carerChipRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  carerChipRoleSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  roleChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  roleChipTextSelected: {
    color: Colors.white,
  },
  timeSelector: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeSelectorText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500' as const,
  },
  timeSelectorTextActive: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  timeBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeBadgeText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  webPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webTimeInput: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  modalCancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  modalConfirmText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  pickerWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  picker: {
    width: 300,
    height: 200,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
