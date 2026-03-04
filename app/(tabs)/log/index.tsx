import React, { useMemo } from 'react';
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
import {
  Plus,
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
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { LogEntry, LogType, LogCategory } from '@/constants/types';

const CATEGORY_COLORS: Record<LogCategory, string> = {
  Medications: Colors.logMedication,
  Meals: Colors.logMeal,
  Medical: Colors.logMedical,
  Activity: Colors.logActivity,
};

function getLogIcon(logType: LogType, size: number, color: string) {
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
      return <FileText size={size} color={color} />;
  }
}

function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(isoString: string) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}

interface GroupedLogs {
  date: string;
  entries: LogEntry[];
}

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logs } = useCare();

  const groupedLogs = useMemo(() => {
    const groups: Record<string, LogEntry[]> = {};
    const sorted = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    sorted.forEach((log) => {
      const dateKey = new Date(log.timestamp).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return Object.entries(groups).map(([date, entries]) => ({
      date,
      entries,
    })) as GroupedLogs[];
  }, [logs]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Log</Text>
        <Text style={styles.headerSubtitle}>
          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock color={Colors.textLight} size={48} />
            <Text style={styles.emptyText}>No log entries yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first entry
            </Text>
          </View>
        ) : (
          groupedLogs.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>
                {formatDate(group.entries[0].timestamp)}
              </Text>
              {group.entries.map((log) => {
                const catColor = CATEGORY_COLORS[log.category];
                return (
                  <View key={log.id} style={styles.logCard}>
                    <View style={[styles.logStripe, { backgroundColor: catColor }]} />
                    <View style={styles.logContent}>
                      <View style={styles.logTop}>
                        <View style={styles.logTypeRow}>
                          <View style={[styles.iconBubble, { backgroundColor: catColor + '15' }]}>
                            {getLogIcon(log.logType, 18, catColor)}
                          </View>
                          <Text style={styles.logType}>{log.logType}</Text>
                        </View>
                        <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                      </View>
                      {log.notes ? (
                        <Text style={styles.logNotes}>{log.notes}</Text>
                      ) : null}
                      <View style={styles.logMeta}>
                        <Text style={styles.logMetaText}>
                          On duty: {log.carerOnDuty}
                        </Text>
                        <Text style={styles.logMetaDot}>·</Text>
                        <Text style={styles.logMetaText}>
                          Logged by {log.loggedBy}
                        </Text>
                      </View>
                      <View style={[styles.categoryTag, { backgroundColor: catColor + '15' }]}>
                        <Text style={[styles.categoryText, { color: catColor }]}>
                          {log.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-log')}
        activeOpacity={0.8}
        testID="add-log-fab"
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
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  logCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
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
  logStripe: {
    width: 5,
  },
  logContent: {
    flex: 1,
    padding: 14,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logType: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
    flexShrink: 1,
  },
  logTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    marginLeft: 8,
  },
  logNotes: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 2,
  },
  logMetaText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  logMetaDot: {
    fontSize: 13,
    color: Colors.textLight,
    marginHorizontal: 6,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 15,
    color: Colors.textLight,
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
