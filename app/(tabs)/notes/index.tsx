import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plus,
  Flag,
  Pill,
  Eye,
  MessageSquare,
  CheckCircle,
  Circle,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { NoteCategory } from '@/constants/types';

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  'Flag for Team': Colors.noteFlag,
  'Meds Renewal': Colors.noteMeds,
  'Pattern Noticed': Colors.notePattern,
  'General': Colors.noteGeneral,
};

function getCategoryIcon(category: NoteCategory, size: number, color: string) {
  switch (category) {
    case 'Flag for Team':
      return <Flag size={size} color={color} />;
    case 'Meds Renewal':
      return <Pill size={size} color={color} />;
    case 'Pattern Noticed':
      return <Eye size={size} color={color} />;
    case 'General':
      return <MessageSquare size={size} color={color} />;
  }
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, toggleNoteStatus } = useCare();

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.status === 'Ongoing' && b.status === 'Resolved') return -1;
      if (a.status === 'Resolved' && b.status === 'Ongoing') return 1;
      if (a.category === 'Flag for Team' && b.category !== 'Flag for Team') return -1;
      if (a.category !== 'Flag for Team' && b.category === 'Flag for Team') return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [notes]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notes Board</Text>
        <Text style={styles.headerSubtitle}>
          {notes.filter((n) => n.status === 'Ongoing').length} ongoing
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare color={Colors.textLight} size={48} />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add a note for the team
            </Text>
          </View>
        ) : (
          sortedNotes.map((note) => {
            const isResolved = note.status === 'Resolved';
            const catColor = CATEGORY_COLORS[note.category];

            return (
              <View
                key={note.id}
                style={[
                  styles.noteCard,
                  isResolved && styles.noteCardResolved,
                ]}
              >
                <View style={styles.noteTop}>
                  <View style={styles.noteTopLeft}>
                    <View
                      style={[
                        styles.categoryBadge,
                        {
                          backgroundColor: isResolved
                            ? Colors.resolved + '30'
                            : catColor + '15',
                        },
                      ]}
                    >
                      {getCategoryIcon(
                        note.category,
                        14,
                        isResolved ? Colors.resolved : catColor
                      )}
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color: isResolved ? Colors.resolved : catColor,
                          },
                        ]}
                      >
                        {note.category}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleNoteStatus(note.id)}
                    style={styles.statusButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {isResolved ? (
                      <CheckCircle size={22} color={Colors.success} />
                    ) : (
                      <Circle size={22} color={Colors.textLight} />
                    )}
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    styles.noteContent,
                    isResolved && styles.noteContentResolved,
                  ]}
                >
                  {note.content}
                </Text>

                {note.imageUri ? (
                  <Image
                    source={{ uri: note.imageUri }}
                    style={styles.noteImage}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.noteMeta}>
                  <Text
                    style={[
                      styles.noteAuthor,
                      isResolved && styles.noteMetaResolved,
                    ]}
                  >
                    {note.author} ({note.authorRole})
                  </Text>
                  <Text
                    style={[
                      styles.noteDate,
                      isResolved && styles.noteMetaResolved,
                    ]}
                  >
                    {formatDate(note.date)}
                  </Text>
                </View>

                {isResolved && (
                  <View style={styles.resolvedTag}>
                    <Text style={styles.resolvedText}>Resolved</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-note')}
        activeOpacity={0.8}
        testID="add-note-fab"
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
  noteCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
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
  noteCardResolved: {
    opacity: 0.65,
  },
  noteTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTopLeft: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statusButton: {
    padding: 4,
  },
  noteContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  noteContentResolved: {
    color: Colors.resolved,
  },
  noteImage: {
    width: '100%' as unknown as number,
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },
  noteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteAuthor: {
    fontSize: 13,
    color: Colors.textLight,
  },
  noteDate: {
    fontSize: 13,
    color: Colors.textLight,
  },
  noteMetaResolved: {
    color: Colors.resolved,
  },
  resolvedTag: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.success,
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
