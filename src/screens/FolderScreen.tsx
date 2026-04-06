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
import InputDialog from '../components/InputDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Folder'>;
type Route = RouteProp<RootStackParamList, 'Folder'>;

const FolderScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { folderId, folderName } = route.params;
  const { colors } = useTheme();
  const { getFolder, addItem, renameItem, deleteItem, togglePinItem } = useData();

  const folder = getFolder(folderId);
  const items = folder?.items || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q));
    }
    // Sort: pinned first, then by creation date
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [items, searchQuery]);

  const handleAdd = (name: string) => {
    addItem(folderId, name);
    setShowAdd(false);
  };

  const handleRename = (name: string) => {
    if (editId) {
      renameItem(folderId, editId, name);
      setEditId(null);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteItem(folderId, deleteId);
      setDeleteId(null);
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
            {folderName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search items..."
      />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon="list-outline"
          message={searchQuery ? 'No items found' : 'No items in this folder'}
          submessage={
            searchQuery
              ? 'Try a different search term'
              : 'Tap the + button to add your first item'
          }
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
              onPress={() =>
                navigation.navigate('Item', {
                  itemId: item.id,
                  itemName: item.name,
                  folderId,
                })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: item.pinned ? '#FEF3C7' : colors.primaryLight }]}>
                <Ionicons
                  name={item.pinned ? 'bookmark' : 'document-text'}
                  size={26}
                  color={item.pinned ? '#F59E0B' : colors.primary}
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.pinned && (
                    <Ionicons name="pin" size={14} color="#F59E0B" style={styles.pinIcon} />
                  )}
                </View>
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                  {item.notes.length} {item.notes.length === 1 ? 'note' : 'notes'}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => togglePinItem(folderId, item.id)}
                  style={styles.actionBtn}
                >
                  <Ionicons
                    name={item.pinned ? 'pin' : 'pin-outline'}
                    size={18}
                    color={item.pinned ? '#F59E0B' : colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditId(item.id);
                    setEditName(item.name);
                  }}
                  style={styles.actionBtn}
                >
                  <Ionicons name="pencil" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteId(item.id);
                    setDeleteName(item.name);
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
        onPress={() => setShowAdd(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Dialogs */}
      <InputDialog
        visible={showAdd}
        title="New Item"
        placeholder="Enter item name"
        onConfirm={handleAdd}
        onCancel={() => setShowAdd(false)}
      />
      <InputDialog
        visible={editId !== null}
        title="Rename Item"
        placeholder="Enter new name"
        initialValue={editName}
        onConfirm={handleRename}
        onCancel={() => setEditId(null)}
      />
      <ConfirmDialog
        visible={deleteId !== null}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteName}"? All notes inside will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  cardMeta: {
    fontSize: 13,
    marginTop: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 2,
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

export default FolderScreen;
