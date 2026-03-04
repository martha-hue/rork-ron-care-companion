import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  Clock,
  FileText,
  StickyNote,
  CalendarDays,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { CARERS } from '@/mocks/data';
import { Carer } from '@/constants/types';

export default function CarerHistoryScreen() {
  const { carerId, carerName } = useLocalSearchParams<{ carerId: string; carerName: string }>();
  const { shifts, logs, notes } = useCare();
  const { carers } = useCarer();

  const carer = useMemo(() => {
    const allCarers = [...CARERS, ...carers];
    return allCarers.find((c) => c.id === carerId) ?? {
      id: carerId ?? '',
      name: carerName ?? '',
      firstName: carerName ?? '',
      lastName: '',
      role: 'Family' as const,
    } as Carer;
  }, [carerId, carerName, carers]);

  const carerShifts = useMemo(() => {
    return shifts
      .filter((s) => s.carerId === carer.id || s.carerName === carer.name)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.startTime.localeCompare(a.startTime);
      });
  }, [shifts, carer]);

  const carerLogs = useMemo(() => {
    return logs
      .filter((l) => l.loggedBy === carer.name)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, carer]);

  const carerNotes = useMemo(() => {
    return notes
      .filter((n) => n.author === carer.name)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [notes, carer]);

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
    });
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    }) + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleColor = getRoleColor(carer.role);

  return (
    <>
      <Stack.Screen options={{ title: `${carer.name}'s History` }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.largeAvatar, { backgroundColor: roleColor }]}>
            <Text style={styles.largeAvatarText}>{getInitials(carer.name)}</Text>
          </View>
          <Text style={styles.profileName}>{carer.name}</Text>
          <Text style={[styles.profileRole, { color: roleColor }]}>{carer.role}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Clock size={18} color={Colors.primary} />
            <Text style={styles.statNumber}>{carerShifts.length}</Text>
            <Text style={styles.statLabel}>Shifts</Text>
          </View>
          <View style={styles.statCard}>
            <FileText size={18} color={Colors.primary} />
            <Text style={styles.statNumber}>{carerLogs.length}</Text>
            <Text style={styles.statLabel}>Logs</Text>
          </View>
          <View style={styles.statCard}>
            <StickyNote size={18} color={Colors.primary} />
            <Text style={styles.statNumber}>{carerNotes.length}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
        </View>

        {carerShifts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CalendarDays size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Shifts</Text>
            </View>
            {carerShifts.map((shift) => (
              <View key={shift.id} style={styles.entryRow}>
                <View style={[styles.entryDot, { backgroundColor: roleColor }]} />
                <View style={styles.entryContent}>
                  <Text style={styles.entryDate}>{formatDate(shift.date)}</Text>
                  <Text style={styles.entryDetail}>
                    {shift.startTime} – {shift.endTime}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {carerLogs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Log Entries</Text>
            </View>
            {carerLogs.map((log) => (
              <View key={log.id} style={styles.entryRow}>
                <View style={[styles.entryDot, { backgroundColor: Colors.logActivity }]} />
                <View style={styles.entryContent}>
                  <View style={styles.entryTopRow}>
                    <Text style={styles.entryType}>{log.logType}</Text>
                    <Text style={styles.entryTimestamp}>{formatTimestamp(log.timestamp)}</Text>
                  </View>
                  {log.notes && (
                    <Text style={styles.entryNotes}>{log.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {carerNotes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <StickyNote size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            {carerNotes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <View style={[styles.noteCategoryBadge, {
                    backgroundColor: note.category === 'Flag for Team' ? Colors.noteFlag + '18'
                      : note.category === 'Meds Renewal' ? Colors.noteMeds + '18'
                      : note.category === 'Pattern Noticed' ? Colors.notePattern + '18'
                      : Colors.noteGeneral + '18',
                  }]}>
                    <Text style={[styles.noteCategoryText, {
                      color: note.category === 'Flag for Team' ? Colors.noteFlag
                        : note.category === 'Meds Renewal' ? Colors.noteMeds
                        : note.category === 'Pattern Noticed' ? Colors.notePattern
                        : Colors.noteGeneral,
                    }]}>
                      {note.category}
                    </Text>
                  </View>
                  <Text style={styles.noteDate}>{formatDate(note.date)}</Text>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
                <View style={[styles.noteStatusBadge, {
                  backgroundColor: note.status === 'Ongoing' ? Colors.warning + '18' : Colors.resolved + '18',
                }]}>
                  <Text style={[styles.noteStatusText, {
                    color: note.status === 'Ongoing' ? Colors.warning : Colors.resolved,
                  }]}>
                    {note.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {carerShifts.length === 0 && carerLogs.length === 0 && carerNotes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history recorded yet for {carer.name}</Text>
          </View>
        )}
      </ScrollView>
    </>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  largeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '700' as const,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  profileRole: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
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
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  entryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  entryContent: {
    flex: 1,
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  entryDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  entryType: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  entryTimestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  entryNotes: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: Colors.cream,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteCategoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  noteCategoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteStatusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  noteStatusText: {
    fontSize: 12,
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
    textAlign: 'center',
  },
});
