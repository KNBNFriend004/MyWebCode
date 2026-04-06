import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Folder, Item, Note } from '../types';
import { loadFolders, saveFolders } from '../utils/storage';

interface DataContextType {
  folders: Folder[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Folder CRUD
  addFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  getFolder: (id: string) => Folder | undefined;
  // Item CRUD
  addItem: (folderId: string, name: string) => void;
  renameItem: (folderId: string, itemId: string, name: string) => void;
  deleteItem: (folderId: string, itemId: string) => void;
  getItem: (folderId: string, itemId: string) => Item | undefined;
  togglePinItem: (folderId: string, itemId: string) => void;
  // Note CRUD
  addNote: (folderId: string, itemId: string, title: string, description: string, date: string) => void;
  updateNote: (folderId: string, itemId: string, noteId: string, title: string, description: string, date: string) => void;
  deleteNote: (folderId: string, itemId: string, noteId: string) => void;
  getNote: (folderId: string, itemId: string, noteId: string) => Note | undefined;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFolders().then((data) => {
      setFolders(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((updated: Folder[]) => {
    setFolders(updated);
    saveFolders(updated);
  }, []);

  // Folder CRUD
  const addFolder = useCallback((name: string) => {
    const now = new Date().toISOString();
    const newFolder: Folder = {
      id: uuidv4(),
      name: name.trim(),
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    persist([...folders, newFolder]);
  }, [folders, persist]);

  const renameFolder = useCallback((id: string, name: string) => {
    const updated = folders.map((f) =>
      f.id === id ? { ...f, name: name.trim(), updatedAt: new Date().toISOString() } : f
    );
    persist(updated);
  }, [folders, persist]);

  const deleteFolder = useCallback((id: string) => {
    persist(folders.filter((f) => f.id !== id));
  }, [folders, persist]);

  const getFolder = useCallback((id: string) => {
    return folders.find((f) => f.id === id);
  }, [folders]);

  // Item CRUD
  const addItem = useCallback((folderId: string, name: string) => {
    const now = new Date().toISOString();
    const newItem: Item = {
      id: uuidv4(),
      name: name.trim(),
      folderId,
      notes: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    const updated = folders.map((f) =>
      f.id === folderId
        ? { ...f, items: [...f.items, newItem], updatedAt: now }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const renameItem = useCallback((folderId: string, itemId: string, name: string) => {
    const now = new Date().toISOString();
    const updated = folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            items: f.items.map((i) =>
              i.id === itemId ? { ...i, name: name.trim(), updatedAt: now } : i
            ),
            updatedAt: now,
          }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const deleteItem = useCallback((folderId: string, itemId: string) => {
    const updated = folders.map((f) =>
      f.id === folderId
        ? { ...f, items: f.items.filter((i) => i.id !== itemId), updatedAt: new Date().toISOString() }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const getItem = useCallback((folderId: string, itemId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    return folder?.items.find((i) => i.id === itemId);
  }, [folders]);

  const togglePinItem = useCallback((folderId: string, itemId: string) => {
    const now = new Date().toISOString();
    const updated = folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            items: f.items.map((i) =>
              i.id === itemId ? { ...i, pinned: !i.pinned, updatedAt: now } : i
            ),
            updatedAt: now,
          }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  // Note CRUD
  const addNote = useCallback((folderId: string, itemId: string, title: string, description: string, date: string) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      date,
      createdAt: now,
      updatedAt: now,
    };
    const updated = folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            items: f.items.map((i) =>
              i.id === itemId
                ? { ...i, notes: [...i.notes, newNote], updatedAt: now }
                : i
            ),
            updatedAt: now,
          }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const updateNote = useCallback((folderId: string, itemId: string, noteId: string, title: string, description: string, date: string) => {
    const now = new Date().toISOString();
    const updated = folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            items: f.items.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    notes: i.notes.map((n) =>
                      n.id === noteId
                        ? { ...n, title: title.trim(), description: description.trim(), date, updatedAt: now }
                        : n
                    ),
                    updatedAt: now,
                  }
                : i
            ),
            updatedAt: now,
          }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const deleteNote = useCallback((folderId: string, itemId: string, noteId: string) => {
    const now = new Date().toISOString();
    const updated = folders.map((f) =>
      f.id === folderId
        ? {
            ...f,
            items: f.items.map((i) =>
              i.id === itemId
                ? { ...i, notes: i.notes.filter((n) => n.id !== noteId), updatedAt: now }
                : i
            ),
            updatedAt: now,
          }
        : f
    );
    persist(updated);
  }, [folders, persist]);

  const getNote = useCallback((folderId: string, itemId: string, noteId: string) => {
    const item = getItem(folderId, itemId);
    return item?.notes.find((n) => n.id === noteId);
  }, [getItem]);

  return (
    <DataContext.Provider
      value={{
        folders,
        loading,
        searchQuery,
        setSearchQuery,
        addFolder,
        renameFolder,
        deleteFolder,
        getFolder,
        addItem,
        renameItem,
        deleteItem,
        getItem,
        togglePinItem,
        addNote,
        updateNote,
        deleteNote,
        getNote,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
