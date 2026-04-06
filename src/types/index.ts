export interface Note {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  folderId: string;
  notes: Note[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  items: Item[];
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'light' | 'dark';

export type RootStackParamList = {
  Home: undefined;
  Folder: { folderId: string; folderName: string };
  Item: { itemId: string; itemName: string; folderId: string };
  NoteDetail: { noteId: string; itemId: string; folderId: string; noteTitle?: string };
  NoteEdit: { noteId?: string; itemId: string; folderId: string };
};
