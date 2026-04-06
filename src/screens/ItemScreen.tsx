import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Item'>;
type Route = RouteProp<RootStackParamList, 'Item'>;

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ItemScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { itemId, itemName, folderId } = route.params;
  const { colors } = useTheme();
  const { getItem, deleteNote } = useData();

  const item = getItem(folderId, itemId);
  const notes = item?.notes || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deleteNoteTitle, setDeleteNoteTitle] = useState('');

  const filteredNotes = useMemo(() => {
    let result = [...notes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    // Sort by date descending (most recent first)
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [notes, searchQuery]);

  const handleDelete = () => {
    if (deleteNoteId) {
      deleteNote(folderId, itemId, deleteNoteId);
      setDeleteNoteId(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {itemName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search notes..."
      />

      {filteredNotes.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          message={searchQuery ? 'No notes found' : 'No notes available'}
          submessage={
            searchQuery
              ? 'Try a different search term'
              : 'Tap the + button to create your first note'
          }
        />
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: note }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
              onPress={() =>
                navigation.navigate('NoteDetail', {
                  noteId: note.id,
                  itemId,
                  folderId,
                  noteTitle: note.title,
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.cardBody}>
                <View style={[styles.dateBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.dateText, { color: colors.primary }]}>
                    {formatDate(note.date)}
                  </Text>
                </View>
                <Text
                  style={[styles.cardTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {note.title || 'Untitled Note'}
                </Text>
                <Text
                  style={[styles.cardDesc, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {note.description || 'No description'}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('NoteEdit', {
                      noteId: note.id,
                      itemId,
                      folderId,
                    })
                  }
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteNoteId(note.id);
                    setDeleteNoteTitle(note.title || 'Untitled Note');
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NoteEdit', { itemId, folderId })}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Dialogs */}
      <ConfirmDialog
        visible={deleteNoteId !== null}
        title="Delete Note"
        message={`Are you sure you want to delete "${deleteNoteTitle}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteNoteId(null)}
      />
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
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  cardBody: {
    marginBottom: 10,
  },
  dateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB20',
    paddingTop: 10,
  },
  actionBtn: {
    padding: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
});

export default ItemScreen;
