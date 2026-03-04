import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { CarerRole, ShiftBlock } from '@/constants/types';

const ROLE_COLORS: Record<CarerRole, string> = {
  'Family': Colors.carerFamily,
  'Care-Team': Colors.carerCareTeam,
  'Private Carer': Colors.carerPrivate,
  'Friend': Colors.carerFriend,
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + mondayOffset);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function ShiftsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getShiftsForDate, getBlocksForDate } = useCare();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  const baseDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }, [weekDates]);

  const selectedDateStr = formatDateStr(selectedDate);
  const shiftsForDay = useMemo(() => getShiftsForDate(selectedDateStr), [getShiftsForDate, selectedDateStr]);
  const blocksForDay = useMemo(() => getBlocksForDate(selectedDateStr), [getBlocksForDate, selectedDateStr]);

  const isToday = useCallback((d: Date) => {
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }, []);

  const isSelected = useCallback((d: Date) => {
    return d.toDateString() === selectedDate.toDateString();
  }, [selectedDate]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shift Calendar</Text>
      </View>

      <View style={styles.weekNav}>
        <TouchableOpacity onPress={() => setWeekOffset((w) => w - 1)} style={styles.navArrow}>
          <ChevronLeft color={Colors.text} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/long-term-calendar')}
          style={styles.weekLabelTouchable}
          activeOpacity={0.6}
        >
          <Text style={styles.weekLabel}>{weekLabel}</Text>
          <Calendar size={16} color={Colors.primary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setWeekOffset((w) => w + 1)} style={styles.navArrow}>
          <ChevronRight color={Colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {weekDates.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dayCell,
              isSelected(d) && styles.dayCellSelected,
              isToday(d) && !isSelected(d) && styles.dayCellToday,
            ]}
            onPress={() => setSelectedDate(d)}
          >
            <Text
              style={[
                styles.dayName,
                isSelected(d) && styles.dayNameSelected,
              ]}
            >
              {DAY_NAMES[i]}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                isSelected(d) && styles.dayNumberSelected,
              ]}
            >
              {d.getDate()}
            </Text>
            {(() => {
              const dayBlocks = getBlocksForDate(formatDateStr(d));
              if (dayBlocks.length === 0) return null;
              return (
                <View style={styles.dayBlockDots}>
                  {dayBlocks.slice(0, 3).map((block: ShiftBlock) => (
                    <View
                      key={block.id}
                      style={[styles.dayBlockDot, { backgroundColor: block.color }]}
                    />
                  ))}
                </View>
              );
            })()}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {blocksForDay.length > 0 && (
          <View style={styles.blocksSection}>
            {blocksForDay.map((block: ShiftBlock) => (
              <View
                key={block.id}
                style={[styles.blockCard, { borderLeftColor: block.color }]}
              >
                <View style={styles.shiftCardHeader}>
                  <Text style={styles.shiftName}>{block.carerName}</Text>
                  <View style={[styles.blockTypeBadge, { backgroundColor: block.color + '20' }]}>
                    <Text style={[styles.blockTypeText, { color: block.color }]}>
                      {block.blockType}
                    </Text>
                  </View>
                </View>
                <Text style={styles.blockDateRange}>
                  {new Date(block.startDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(block.endDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </Text>
                {block.notes ? <Text style={styles.blockNotes}>{block.notes}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {shiftsForDay.length === 0 && blocksForDay.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No shifts scheduled for this day</Text>
          </View>
        ) : (
          shiftsForDay.map((shift) => (
            <View
              key={shift.id}
              style={[
                styles.shiftCard,
                { borderLeftColor: ROLE_COLORS[shift.carerRole] },
              ]}
            >
              <View style={styles.shiftCardHeader}>
                <Text style={styles.shiftName}>{shift.carerName}</Text>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: ROLE_COLORS[shift.carerRole] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      { color: ROLE_COLORS[shift.carerRole] },
                    ]}
                  >
                    {shift.carerRole}
                  </Text>
                </View>
              </View>
              <Text style={styles.shiftTime}>
                {shift.startTime} – {shift.endTime}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-shift')}
        activeOpacity={0.8}
        testID="add-shift-button"
      >
        <Plus color={Colors.white} size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navArrow: {
    padding: 8,
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 2,
    marginBottom: 12,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.cardBg,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    backgroundColor: Colors.creamDark,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  dayNameSelected: {
    color: Colors.white,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  selectedDateHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  shiftCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
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
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  shiftName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  shiftTime: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  weekLabelTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBlockDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  dayBlockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  blocksSection: {
    marginBottom: 8,
  },
  blockCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
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
  blockTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  blockTypeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  blockDateRange: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  blockNotes: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(192, 104, 48, 0.3)',
      },
    }),
  },
});
