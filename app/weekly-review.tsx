import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  BarChart3,
  Footprints,
  AlertTriangle,
  Pill,
  Users,
  ChevronRight,
  Archive,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { MOCK_WEEKLY_REVIEW, PATIENT_NAME, PAST_WEEKLY_REVIEWS } from '@/mocks/data';
import { WeeklyReview } from '@/constants/types';

export default function WeeklyReviewScreen() {
  const [selectedPastReview, setSelectedPastReview] = useState<WeeklyReview | null>(null);

  const review = selectedPastReview ?? MOCK_WEEKLY_REVIEW;

  const formatWeekRange = (r: WeeklyReview) => {
    const start = new Date(r.weekStarting);
    const end = new Date(r.weekEnding);
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  };

  const formatWeekRangeShort = (r: WeeklyReview) => {
    const start = new Date(r.weekStarting);
    const end = new Date(r.weekEnding);
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${startStr} – ${endStr}`;
  };

  const renderReviewContent = (r: WeeklyReview) => (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BarChart3 size={20} color={Colors.primary} />
          <Text style={styles.sectionTitle}>Overall Snapshot</Text>
        </View>
        <Text style={styles.sectionBody}>{r.snapshot}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Footprints size={20} color={Colors.logActivity} />
          <Text style={styles.sectionTitle}>Activity Highlights</Text>
        </View>
        {r.activityHighlights.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: Colors.logActivity }]} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={20} color={Colors.warmRed} />
          <Text style={styles.sectionTitle}>Incidents & Flags</Text>
        </View>
        {r.incidents.length === 0 ? (
          <Text style={styles.emptyText}>No incidents this week</Text>
        ) : (
          r.incidents.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bullet, { backgroundColor: Colors.warmRed }]} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Pill size={20} color={Colors.logMedication} />
          <Text style={styles.sectionTitle}>Medication Notes</Text>
        </View>
        {r.medicationNotes.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: Colors.logMedication }]} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color={Colors.primaryLight} />
          <Text style={styles.sectionTitle}>Team Observations</Text>
        </View>
        {r.teamObservations.map((item, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: Colors.primaryLight }]} />
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {selectedPastReview && (
        <TouchableOpacity
          style={styles.backToCurrent}
          onPress={() => setSelectedPastReview(null)}
          activeOpacity={0.7}
        >
          <Text style={styles.backToCurrentText}>← Back to current week</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>
          {selectedPastReview ? 'Past Review' : `${PATIENT_NAME}'s Week`}
        </Text>
        <Text style={styles.headerDate}>{formatWeekRange(review)}</Text>
      </View>

      {renderReviewContent(review)}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a team summary, not a medical diagnosis. Always consult {PATIENT_NAME}'s GP for clinical decisions.
        </Text>
      </View>

      {!selectedPastReview && (
        <View style={styles.pastReviewsSection}>
          <View style={styles.pastReviewsHeader}>
            <Archive size={18} color={Colors.primary} />
            <Text style={styles.pastReviewsTitle}>Past Reviews</Text>
          </View>

          {PAST_WEEKLY_REVIEWS.map((pastReview, index) => (
            <TouchableOpacity
              key={index}
              style={styles.pastReviewCard}
              onPress={() => setSelectedPastReview(pastReview)}
              activeOpacity={0.7}
              testID={`past-review-${index}`}
            >
              <View style={styles.pastReviewContent}>
                <Text style={styles.pastReviewDate}>
                  {formatWeekRangeShort(pastReview)}
                </Text>
                <Text style={styles.pastReviewPreview} numberOfLines={1}>
                  {pastReview.snapshot}
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textLight} />
            </TouchableOpacity>
          ))}

          {PAST_WEEKLY_REVIEWS.length === 0 && (
            <View style={styles.emptyArchive}>
              <Text style={styles.emptyText}>No past reviews yet</Text>
            </View>
          )}
        </View>
      )}
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
  backToCurrent: {
    marginBottom: 12,
  },
  backToCurrentText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  headerCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
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
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 8px rgba(192, 104, 48, 0.06)',
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sectionBody: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textLight,
    fontStyle: 'italic' as const,
  },
  footer: {
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: 'center',
  },
  pastReviewsSection: {
    marginTop: 24,
  },
  pastReviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  pastReviewsTitle: {
    fontSize: 19,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pastReviewCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 2px 6px rgba(192, 104, 48, 0.05)' },
    }),
  },
  pastReviewContent: {
    flex: 1,
    marginRight: 10,
  },
  pastReviewDate: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  pastReviewPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyArchive: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
