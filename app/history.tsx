import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  StickyNote,
  Filter,
  ChevronDown,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { CARERS } from '@/mocks/data';
import { Carer, Shift } from '@/constants/types';

type TabType = 'carers' | 'shifts';

export default function HistoryScreen() {
  const router = useRouter();
  const { shifts, logs, notes } = useCare();
  const { carers } = useCarer();
  const [activeTab, setActiveTab] = useState<TabType>('carers');
  const [filterCarer, setFilterCarer] = useState<string | null>(null);
  const [showCarerFilter, setShowCarerFilter] = useState(false);

  const allCarers = useMemo(() => {
    const carerMap = new Map<string, Carer>();
    CARERS.forEach((c) => carerMap.set(c.id, c));
    carers.forEach((c) => carerMap.set(c.id, c));
    const fromShifts = shifts.map((s) => ({
      id: s.carerId,
      name: s.carerName,
      firstName: s.carerName,
      lastName: '',
      role: s.carerRole,
    }));
    fromShifts.forEach((c) => {
      if (!carerMap.has(c.id)) carerMap.set(c.id, c as Carer);
    });
    return Array.from(carerMap.values());
  }, [carers, shifts]);

  const getCarerStats = useCallback(
    (carer: Carer) => {
      const carerShifts = shifts.filter((s) => s.carerId === carer.id || s.carerName === carer.name);
      const carerLogs = logs.filter((l) => l.loggedBy === carer.name);
      const carerNotes = notes.filter((n) => n.author === carer.name);
      return {
        shifts: carerShifts.length,
        logs: carerLogs.length,
        notes: carerNotes.length,
        total: carerShifts.length + carerLogs.length + carerNotes.length,
      };
    },
    [shifts, logs, notes]
  );

  const sortedShifts = useMemo(() => {
    let filtered = [...shifts];
    if (filterCarer) {
      filtered = filtered.filter((s) => s.carerId === filterCarer || s.carerName === filterCarer);
    }
    return filtered.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.startTime.localeCompare(a.startTime);
    });
  }, [shifts, filterCarer]);

  const getShiftLogs = useCallback(
    (shift: Shift) => {
      return logs.filter((l) => {
        const logDate = l.timestamp.split('T')[0];
        return logDate === shift.date && l.carerOnDuty === shift.carerName;
      });
    },
    [logs]
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Family': return Colors.carerFamily;
      case 'Care-Team': return Colors.carerCareTeam;
      case 'Private Carer': return Colors.carerPrivate;
      case 'Friend': return Colors.carerFriend;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderCarersList = () => (
    <View style={styles.listContainer}>
      {allCarers.map((carer) => {
        const stats = getCarerStats(carer);
        return (
          <TouchableOpacity
            key={carer.id}
            style={styles.carerCard}
            activeOpacity={0.7}
            onPress={() => router.push(`/carer-history?carerId=${carer.id}&carerName=${carer.name}`)}
            testID={`carer-history-${carer.id}`}
          >
            <View style={styles.carerCardLeft}>
              <View style={[styles.avatar, { backgroundColor: getRoleColor(carer.role) }]}>
                <Text style={styles.avatarText}>{getInitials(carer.name)}</Text>
              </View>
              <View style={styles.carerInfo}>
                <Text style={styles.carerName}>{carer.name}</Text>
                <Text style={[styles.carerRole, { color: getRoleColor(carer.role) }]}>
                  {carer.role}
                </Text>
              </View>
            </View>
            <View style={styles.carerCardRight}>
              <View style={styles.statRow}>
                <Clock size={13} color={Colors.textLight} />
                <Text style={styles.statText}>{stats.shifts}</Text>
                <FileText size={13} color={Colors.textLight} />
                <Text style={styles.statText}>{stats.logs}</Text>
                <StickyNote size={13} color={Colors.textLight} />
                <Text style={styles.statText}>{stats.notes}</Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </View>
          </TouchableOpacity>
        );
      })}
      {allCarers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No team members yet</Text>
        </View>
      )}
    </View>
  );

  const renderShiftOverview = () => (
    <View style={styles.listContainer}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowCarerFilter(!showCarerFilter)}
        activeOpacity={0.7}
      >
        <Filter size={16} color={Colors.primary} />
        <Text style={styles.filterButtonText}>
          {filterCarer
            ? allCarers.find((c) => c.id === filterCarer || c.name === filterCarer)?.name ?? 'All Carers'
            : 'All Carers'}
        </Text>
        <ChevronDown size={16} color={Colors.primary} />
      </TouchableOpacity>

      {showCarerFilter && (
        <View style={styles.filterDropdown}>
          <TouchableOpacity
            style={[styles.filterOption, !filterCarer && styles.filterOptionActive]}
            onPress={() => { setFilterCarer(null); setShowCarerFilter(false); }}
          >
            <Text style={[styles.filterOptionText, !filterCarer && styles.filterOptionTextActive]}>
              All Carers
            </Text>
          </TouchableOpacity>
          {allCarers.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.filterOption, filterCarer === c.id && styles.filterOptionActive]}
              onPress={() => { setFilterCarer(c.id); setShowCarerFilter(false); }}
            >
              <Text style={[styles.filterOptionText, filterCarer === c.id && styles.filterOptionTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {sortedShifts.map((shift) => {
        const shiftLogs = getShiftLogs(shift);
        return (
          <View key={shift.id} style={styles.shiftCard}>
            <View style={styles.shiftCardHeader}>
              <View style={styles.shiftCardLeft}>
                <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(shift.carerRole) }]} />
                <View>
                  <Text style={styles.shiftCarerName}>{shift.carerName}</Text>
                  <Text style={[styles.shiftCarerRole, { color: getRoleColor(shift.carerRole) }]}>
                    {shift.carerRole}
                  </Text>
                </View>
              </View>
              <View style={styles.shiftCardRight}>
                <Text style={styles.shiftDate}>{formatDate(shift.date)}</Text>
                <Text style={styles.shiftTime}>{shift.startTime} – {shift.endTime}</Text>
              </View>
            </View>
            {shiftLogs.length > 0 && (
              <View style={styles.shiftLogsSection}>
                <Text style={styles.shiftLogsLabel}>
                  {shiftLogs.length} log {shiftLogs.length === 1 ? 'entry' : 'entries'}
                </Text>
                {shiftLogs.slice(0, 3).map((log) => (
                  <View key={log.id} style={styles.miniLogRow}>
                    <View style={styles.miniLogDot} />
                    <Text style={styles.miniLogType}>{log.logType}</Text>
                    {log.notes && (
                      <Text style={styles.miniLogNote} numberOfLines={1}>
                        — {log.notes}
                      </Text>
                    )}
                  </View>
                ))}
                {shiftLogs.length > 3 && (
                  <Text style={styles.moreLogsText}>
                    +{shiftLogs.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </View>
        );
      })}

      {sortedShifts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No shifts recorded yet</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'carers' && styles.tabActive]}
          onPress={() => setActiveTab('carers')}
          activeOpacity={0.7}
        >
          <Users size={16} color={activeTab === 'carers' ? Colors.white : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'carers' && styles.tabTextActive]}>
            Team
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shifts' && styles.tabActive]}
          onPress={() => setActiveTab('shifts')}
          activeOpacity={0.7}
        >
          <Calendar size={16} color={activeTab === 'shifts' ? Colors.white : Colors.primary} />
          <Text style={[styles.tabText, activeTab === 'shifts' && styles.tabTextActive]}>
            Shifts
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'carers' ? renderCarersList() : renderShiftOverview()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.creamDark,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 11,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  listContainer: {
    gap: 12,
  },
  carerCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(192, 104, 48, 0.06)' },
    }),
  },
  carerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  carerInfo: {
    flex: 1,
  },
  carerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  carerRole: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  carerCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as const,
    marginRight: 6,
  },
  shiftCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 8px rgba(192, 104, 48, 0.06)' },
    }),
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shiftCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  roleIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  shiftCarerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  shiftCarerRole: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginTop: 1,
  },
  shiftCardRight: {
    alignItems: 'flex-end',
  },
  shiftDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  shiftTime: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  shiftLogsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  shiftLogsLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  miniLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  miniLogDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  miniLogType: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  miniLogNote: {
    fontSize: 13,
    color: Colors.textLight,
    flex: 1,
  },
  moreLogsText: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
    marginTop: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  filterDropdown: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 12px rgba(192, 104, 48, 0.1)' },
    }),
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterOptionActive: {
    backgroundColor: Colors.creamDark,
  },
  filterOptionText: {
    fontSize: 15,
    color: Colors.text,
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
  },
});
