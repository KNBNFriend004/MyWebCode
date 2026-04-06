import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import InputDialog from '../components/InputDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, toggleTheme, mode } = useTheme();
  const { folders, loading, addFolder, renameFolder, deleteFolder } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q));
  }, [folders, searchQuery]);

  const handleAdd = (name: string) => {
    addFolder(name);
    setShowAdd(false);
  };

  const handleRename = (name: string) => {
    if (editId) {
      renameFolder(editId, name);
      setEditId(null);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFolder(deleteId);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Folders</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeButton, { backgroundColor: colors.primaryLight }]}
        >
          <Ionicons
            name={mode === 'light' ? 'moon' : 'sunny'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search folders..."
      />

      {filteredFolders.length === 0 ? (
        <EmptyState
          icon="folder-open-outline"
          message={searchQuery ? 'No folders found' : 'No folders yet'}
          submessage={
            searchQuery
              ? 'Try a different search term'
              : 'Tap the + button to create your first folder'
          }
        />
      ) : (
        <FlatList
          data={filteredFolders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
              onPress={() => navigation.navigate('Folder', { folderId: item.id, folderName: item.name })}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="folder" size={28} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                  {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <View style={styles.cardActions}>
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
        title="New Folder"
        placeholder="Enter folder name"
        onConfirm={handleAdd}
        onCancel={() => setShowAdd(false)}
      />
      <InputDialog
        visible={editId !== null}
        title="Rename Folder"
        placeholder="Enter new name"
        initialValue={editName}
        onConfirm={handleRename}
        onCancel={() => setEditId(null)}
      />
      <ConfirmDialog
        visible={deleteId !== null}
        title="Delete Folder"
        message={`Are you sure you want to delete "${deleteName}"? All items and notes inside will be permanently removed.`}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardMeta: {
    fontSize: 13,
    marginTop: 3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
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

export default HomeScreen;
