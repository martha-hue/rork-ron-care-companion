import React from 'react';
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
  Clock,
  UserCheck,
  TrendingUp,
  Plus,
  User,
  History,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getCurrentShift, getLatestLog } = useCare();
  const { currentCarer, patient } = useCarer();

  const patientName = patient?.firstName ?? 'Ron';

  const currentShift = getCurrentShift();
  const latestLog = getLatestLog();

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleArea}>
            <Text style={styles.title}>{patientName}'s Care Hub</Text>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              if (currentCarer) {
                router.push('/profile');
              } else {
                router.push('/login');
              }
            }}
            testID="profile-button"
          >
            <User color={Colors.white} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentCarer && (
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeText}>
              Welcome, {currentCarer.name}
            </Text>
            <Text style={styles.roleText}>{currentCarer.role}</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <UserCheck color={Colors.primary} size={20} />
            <Text style={styles.cardTitle}>Currently On Shift</Text>
          </View>
          {currentShift ? (
            <View style={styles.cardBody}>
              <Text style={styles.shiftName}>{currentShift.carerName}</Text>
              <Text style={styles.shiftRole}>{currentShift.carerRole}</Text>
              <Text style={styles.shiftTime}>
                {currentShift.startTime} – {currentShift.endTime}
              </Text>
            </View>
          ) : (
            <View style={styles.cardBody}>
              <Text style={styles.emptyText}>No one currently on shift</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock color={Colors.primary} size={20} />
            <Text style={styles.cardTitle}>Latest Update</Text>
          </View>
          {latestLog ? (
            <View style={styles.cardBody}>
              <View style={styles.logRow}>
                <Text style={styles.logType}>{latestLog.logType}</Text>
                <Text style={styles.logTime}>
                  {formatTime(latestLog.timestamp)}
                </Text>
              </View>
              {latestLog.notes ? (
                <Text style={styles.logNotes}>{latestLog.notes}</Text>
              ) : null}
              <Text style={styles.loggedBy}>
                Logged by {latestLog.loggedBy} ({latestLog.loggedByRole})
              </Text>
            </View>
          ) : (
            <View style={styles.cardBody}>
              <Text style={styles.emptyText}>No log entries yet</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/add-log')}
          activeOpacity={0.8}
          testID="add-log-button"
        >
          <Plus color={Colors.white} size={22} />
          <Text style={styles.primaryButtonText}>Add New Log Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/weekly-review')}
          activeOpacity={0.8}
          testID="weekly-review-button"
        >
          <TrendingUp color={Colors.primary} size={20} />
          <Text style={styles.secondaryButtonText}>View Weekly Review</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyCard}
          onPress={() => router.push('/history')}
          activeOpacity={0.7}
          testID="history-button"
        >
          <View style={styles.historyIconWrap}>
            <History color={Colors.white} size={22} />
          </View>
          <View style={styles.historyContent}>
            <Text style={styles.historyTitle}>History</Text>
            <Text style={styles.historySubtitle}>View past shifts, logs & team activity</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleArea: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeBanner: {
    backgroundColor: Colors.creamDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  roleText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(192, 104, 48, 0.08)',
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  cardBody: {
    gap: 4,
  },
  shiftName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  shiftRole: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  shiftTime: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logType: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  logTime: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  logNotes: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  loggedBy: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  historyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(192, 104, 48, 0.08)',
      },
    }),
  },
  historyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  historySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
