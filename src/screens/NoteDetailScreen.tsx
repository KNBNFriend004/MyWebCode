import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;
type Route = RouteProp<RootStackParamList, 'NoteDetail'>;

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NoteDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { noteId, itemId, folderId } = route.params;
  const { colors } = useTheme();
  const { getNote } = useData();

  const note = getNote(folderId, itemId, noteId);

  if (!note) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Note Not Found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {note.title || 'Untitled Note'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NoteEdit', { noteId, itemId, folderId })
          }
          style={[styles.editBtn, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons name="pencil" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Date Section */}
        <View style={[styles.dateSection, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={[styles.dateIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="calendar" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Date</Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatDate(note.date)}
            </Text>
          </View>
        </View>

        {/* Title Section */}
        {note.title ? (
          <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Title</Text>
            <Text style={[styles.titleText, { color: colors.text }]}>{note.title}</Text>
          </View>
        ) : null}

        {/* Description Section */}
        <View style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Description</Text>
          {note.description ? (
            <MarkdownRenderer
              text={note.description}
              textColor={colors.text}
              secondaryColor={colors.textSecondary}
              accentColor={colors.primary}
            />
          ) : (
            <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
              No description provided.
            </Text>
          )}
        </View>

        {/* Metadata */}
        <View style={[styles.metaSection, { borderTopColor: colors.border }]}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Created: {formatDate(note.createdAt)} at {formatTime(note.createdAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              Updated: {formatDate(note.updatedAt)} at {formatTime(note.updatedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 40,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    gap: 14,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  metaSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
});

export default NoteDetailScreen;
