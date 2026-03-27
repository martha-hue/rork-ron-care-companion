import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, X, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { ShiftBlock, CarerRole, BlockType } from '@/constants/types';

const BLOCK_COLORS = [
  '#C4533A',
  '#CB3A4B',
  '#C06830',
  '#D4804A',
  '#B8685C',
  '#907868',
  '#5A9E6F',
  '#6B8E9B',
];

const BLOCK_TYPES: BlockType[] = ['Covering Shift', 'Off / Unavailable'];
const ROLES: CarerRole[] = ['Family', 'Care-Team', 'Private Carer', 'Friend'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 40) / 7);

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getBlockColorForCarer(blocks: ShiftBlock[], carerName: string): string {
  const uniqueCarers = [...new Set(blocks.map(b => b.carerName))];
  const idx = uniqueCarers.indexOf(carerName);
  if (idx >= 0) return BLOCK_COLORS[idx % BLOCK_COLORS.length];
  return BLOCK_COLORS[0];
}

interface MonthData {
  year: number;
  month: number;
}

function getMonthRange(centerDate: Date, range: number): MonthData[] {
  const months: MonthData[] = [];
  for (let i = -range; i <= range; i++) {
    const d = new Date(centerDate.getFullYear(), centerDate.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
}

export default function LongTermCalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shiftBlocks, addShiftBlock, updateShiftBlock, deleteShiftBlock } = useCare();
  const { carers } = useCarer();
  const scrollRef = useRef<ScrollView>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ShiftBlock | null>(null);

  const [formCarerName, setFormCarerName] = useState('');
  const [formRole, setFormRole] = useState<CarerRole | null>(null);
  const [formBlockType, setFormBlockType] = useState<BlockType | null>(null);
  const [formNotes, setFormNotes] = useState('');
  const [showCarerDropdown, setShowCarerDropdown] = useState(false);

  const months = useMemo(() => getMonthRange(new Date(), 12), []);

  const todayStr = useMemo(() => formatDateStr(new Date()), []);

  const handleDayPress = useCallback((dateStr: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
    } else {
      if (dateStr < startDate) {
        setEndDate(startDate);
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
      }
      setTimeout(() => {
        setShowForm(true);
        setEditingBlock(null);
        setFormCarerName('');
        setFormRole(null);
        setFormBlockType(null);
        setFormNotes('');
      }, 200);
    }
  }, [startDate, endDate]);

  const handleBlockTap = useCallback((block: ShiftBlock) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setEditingBlock(block);
    setStartDate(block.startDate);
    setEndDate(block.endDate);
    setFormCarerName(block.carerName);
    setFormRole(block.carerRole);
    setFormBlockType(block.blockType);
    setFormNotes(block.notes ?? '');
    setShowForm(true);
  }, []);

  const isInRange = useCallback((dateStr: string) => {
    if (!startDate) return false;
    if (!endDate) return dateStr === startDate;
    return dateStr >= startDate && dateStr <= endDate;
  }, [startDate, endDate]);

  const isRangeStart = useCallback((dateStr: string) => {
    return dateStr === startDate;
  }, [startDate]);

  const isRangeEnd = useCallback((dateStr: string) => {
    if (!endDate) return dateStr === startDate;
    return dateStr === endDate;
  }, [startDate, endDate]);

  const getBlocksForDay = useCallback((dateStr: string) => {
    return shiftBlocks.filter(b => dateStr >= b.startDate && dateStr <= b.endDate);
  }, [shiftBlocks]);

  const handleSave = useCallback(() => {
    if (!formCarerName.trim()) {
      Alert.alert('Missing Info', 'Please select or enter a carer name.');
      return;
    }
    if (!formRole) {
      Alert.alert('Missing Info', 'Please select a role.');
      return;
    }
    if (!formBlockType) {
      Alert.alert('Missing Info', 'Please select a block type.');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Missing Info', 'Please select a date range.');
      return;
    }

    const color = getBlockColorForCarer(shiftBlocks, formCarerName.trim()) ||
      BLOCK_COLORS[shiftBlocks.length % BLOCK_COLORS.length];

    if (editingBlock) {
      const updated: ShiftBlock = {
        ...editingBlock,
        carerName: formCarerName.trim(),
        carerRole: formRole,
        startDate,
        endDate,
        blockType: formBlockType,
        notes: formNotes.trim() || undefined,
        color: editingBlock.color,
      };
      updateShiftBlock(updated);
    } else {
      const block: ShiftBlock = {
        id: `blk_${Date.now()}`,
        carerId: carers.find(c => c.name === formCarerName.trim())?.id ?? `custom_${Date.now()}`,
        carerName: formCarerName.trim(),
        carerRole: formRole,
        startDate,
        endDate,
        blockType: formBlockType,
        notes: formNotes.trim() || undefined,
        color,
      };
      addShiftBlock(block);
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setShowForm(false);
    setStartDate(null);
    setEndDate(null);
    setEditingBlock(null);
  }, [formCarerName, formRole, formBlockType, formNotes, startDate, endDate, editingBlock, shiftBlocks, carers, addShiftBlock, updateShiftBlock]);

  const handleDelete = useCallback(() => {
    if (!editingBlock) return;
    Alert.alert('Delete Block', 'Are you sure you want to delete this shift block?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteShiftBlock(editingBlock.id);
          setShowForm(false);
          setStartDate(null);
          setEndDate(null);
          setEditingBlock(null);
        },
      },
    ]);
  }, [editingBlock, deleteShiftBlock]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    if (!editingBlock) {
      setStartDate(null);
      setEndDate(null);
    }
    setEditingBlock(null);
  }, [editingBlock]);

  const selectCarer = useCallback((name: string, role: CarerRole) => {
    setFormCarerName(name);
    setFormRole(role);
    setShowCarerDropdown(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const renderMonth = useCallback((monthData: MonthData) => {
    const { year, month } = monthData;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return (
      <View key={`${year}-${month}`} style={styles.monthContainer}>
        <Text style={styles.monthTitle}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <View style={styles.dayHeaderRow}>
          {DAY_HEADERS.map((d, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) => {
              if (day === null) {
                return <View key={di} style={styles.dayCell} />;
              }
              const dateStr = formatDateStr(new Date(year, month, day));
              const inRange = isInRange(dateStr);
              const isStart = isRangeStart(dateStr);
              const isEnd = isRangeEnd(dateStr);
              const isToday = dateStr === todayStr;
              const dayBlocks = getBlocksForDay(dateStr);
              const isSingle = isStart && isEnd;

              return (
                <TouchableOpacity
                  key={di}
                  style={styles.dayCell}
                  onPress={() => handleDayPress(dateStr)}
                  activeOpacity={0.6}
                >
                  {inRange && (
                    <View
                      style={[
                        styles.rangeHighlight,
                        isSingle && styles.rangeSingle,
                        isStart && !isSingle && styles.rangeStart,
                        isEnd && !isSingle && styles.rangeEnd,
                        !isStart && !isEnd && styles.rangeMid,
                      ]}
                    />
                  )}
                  <View style={[
                    styles.dayNumberContainer,
                    isToday && !inRange && styles.todayCircle,
                  ]}>
                    <Text
                      style={[
                        styles.dayText,
                        isToday && !inRange && styles.todayText,
                        inRange && styles.rangeText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                  {dayBlocks.length > 0 && (
                    <View style={styles.blockDotsRow}>
                      {dayBlocks.slice(0, 3).map((block, bi) => (
                        <TouchableOpacity
                          key={block.id}
                          onPress={() => handleBlockTap(block)}
                          style={[styles.blockDot, { backgroundColor: block.color }]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [isInRange, isRangeStart, isRangeEnd, todayStr, getBlocksForDay, handleDayPress, handleBlockTap]);

  const renderFormModal = () => (
    <Modal
      visible={showForm}
      transparent
      animationType="slide"
      onRequestClose={closeForm}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>
                    {editingBlock ? 'Edit Shift Block' : 'New Shift Block'}
                  </Text>
                  <View style={styles.modalHeaderActions}>
                    {editingBlock && (
                      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                        <Trash2 size={20} color={Colors.danger} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={closeForm} style={styles.closeBtn}>
                      <X size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.dateRangeDisplay}>
                  <Text style={styles.dateRangeText}>
                    {startDate && endDate
                      ? `${parseDateStr(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${parseDateStr(endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'Select dates'}
                  </Text>
                </View>

                <ScrollView
                  style={styles.formScroll}
                  contentContainerStyle={styles.formScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.formLabel}>Carer</Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCarerDropdown(!showCarerDropdown)}
                  >
                    <Text style={[
                      styles.dropdownText,
                      !formCarerName && styles.dropdownPlaceholder,
                    ]}>
                      {formCarerName || 'Select carer...'}
                    </Text>
                  </TouchableOpacity>
                  {showCarerDropdown && (
                    <View style={styles.dropdownList}>
                      {carers.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.dropdownItem,
                            formCarerName === c.name && styles.dropdownItemSelected,
                          ]}
                          onPress={() => selectCarer(c.name, c.role)}
                        >
                          <Text style={[
                            styles.dropdownItemText,
                            formCarerName === c.name && styles.dropdownItemTextSelected,
                          ]}>
                            {c.name}
                          </Text>
                          <Text style={[
                            styles.dropdownItemRole,
                            formCarerName === c.name && styles.dropdownItemRoleSelected,
                          ]}>
                            {c.role}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <Text style={styles.formLabel}>Role</Text>
                  <View style={styles.chipRow}>
                    {ROLES.map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.chip,
                          formRole === role && styles.chipSelected,
                        ]}
                        onPress={() => {
                          setFormRole(role);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Text style={[
                          styles.chipText,
                          formRole === role && styles.chipTextSelected,
                        ]}>
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Block Type</Text>
                  <View style={styles.chipRow}>
                    {BLOCK_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.chip,
                          styles.chipWide,
                          formBlockType === type && styles.chipSelected,
                        ]}
                        onPress={() => {
                          setFormBlockType(type);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                      >
                        <Text style={[
                          styles.chipText,
                          formBlockType === type && styles.chipTextSelected,
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Notes (optional)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="e.g. James covering while Sarah is away"
                    placeholderTextColor={Colors.textLight}
                    value={formNotes}
                    onChangeText={setFormNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveButtonText}>
                      {editingBlock ? 'Update Block' : 'Save Block'}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Long Term Calendar</Text>
        <View style={styles.backBtn} />
      </View>

      {(startDate && !endDate) && (
        <View style={styles.selectionHint}>
          <Text style={styles.selectionHintText}>Tap an end date to set range</Text>
        </View>
      )}
      {(startDate && endDate && !showForm) && (
        <View style={styles.selectionHint}>
          <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); }}>
            <Text style={styles.selectionClearText}>Clear selection</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.calendarScroll}
        contentContainerStyle={styles.calendarContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dayHeaderRow}>
          {DAY_HEADERS.map((d, i) => (
            <View key={i} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>
        {months.map((m) => renderMonth(m))}
      </ScrollView>

      {renderFormModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  selectionHint: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#C4533A10',
  },
  selectionHintText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  selectionClearText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  calendarScroll: {
    flex: 1,
  },
  calendarContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  monthContainer: {
    marginTop: 24,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeaderCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textLight,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: CELL_SIZE + 6,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    position: 'relative',
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  todayCircle: {
    backgroundColor: Colors.creamDark,
  },
  todayText: {
    fontWeight: '700' as const,
    color: Colors.text,
  },
  rangeHighlight: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: '#C4533A20',
    zIndex: 1,
  },
  rangeSingle: {
    left: (CELL_SIZE - 32) / 2,
    right: (CELL_SIZE - 32) / 2,
    borderRadius: 16,
    backgroundColor: '#C4533A',
  },
  rangeStart: {
    left: (CELL_SIZE - 32) / 2,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  rangeEnd: {
    right: (CELL_SIZE - 32) / 2,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  rangeMid: {
    borderRadius: 0,
  },
  rangeText: {
    color: '#C4533A',
    fontWeight: '700' as const,
  },
  blockDotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
    zIndex: 3,
  },
  blockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#F5EDE0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
  },
  closeBtn: {
    padding: 4,
  },
  dateRangeDisplay: {
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#C4533A12',
    borderRadius: 10,
    marginBottom: 8,
  },
  dateRangeText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
  },
  formScroll: {
    maxHeight: 420,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  dropdownPlaceholder: {
    color: Colors.textLight,
  },
  dropdownList: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  dropdownItemSelected: {
    backgroundColor: '#C4533A12',
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  dropdownItemRole: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dropdownItemRoleSelected: {
    color: Colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipWide: {
    flex: 1,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#C4533A',
    borderColor: '#C4533A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  notesInput: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 72,
  },
  saveButton: {
    backgroundColor: '#C4533A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
