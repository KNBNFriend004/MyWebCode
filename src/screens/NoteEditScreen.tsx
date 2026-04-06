import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoteEdit'>;
type Route = RouteProp<RootStackParamList, 'NoteEdit'>;

const formatDateForInput = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const NoteEditScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { noteId, itemId, folderId } = route.params;
  const { colors } = useTheme();
  const { getNote, addNote, updateNote } = useData();

  const isEditing = !!noteId;
  const existingNote = noteId ? getNote(folderId, itemId, noteId) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(formatDateForInput(new Date().toISOString()));
  const [errors, setErrors] = useState<{ description?: string; date?: string }>({});
  const [selection, setSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const descriptionRef = useRef<TextInput>(null);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setDescription(existingNote.description);
      setDate(formatDateForInput(existingNote.date));
    }
  }, [existingNote]);

  const validate = (): boolean => {
    const newErrors: { description?: string; date?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description cannot be empty';
    }

    if (!date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Use format YYYY-MM-DD';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const isoDate = new Date(date + 'T00:00:00').toISOString();

    if (isEditing && noteId) {
      updateNote(folderId, itemId, noteId, title, description, isoDate);
    } else {
      addNote(folderId, itemId, title, description, isoDate);
    }

    navigation.goBack();
  };

  const handleSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    setSelection(e.nativeEvent.selection);
  };

  const insertFormatting = (prefix: string, suffix: string, placeholder: string) => {
    const { start, end } = selection;
    const selectedText = description.slice(start, end);
    const textToInsert = selectedText.length > 0 ? selectedText : placeholder;
    const newText =
      description.slice(0, start) + prefix + textToInsert + suffix + description.slice(end);
    setDescription(newText);

    const newCursorPos = start + prefix.length + textToInsert.length;
    setTimeout(() => {
      setSelection({ start: newCursorPos, end: newCursorPos });
      descriptionRef.current?.focus();
    }, 50);
  };

  const insertLinePrefix = (prefix: string) => {
    const { start } = selection;
    const beforeCursor = description.slice(0, start);
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const isAtLineStart = start === lineStart || description.slice(lineStart, start).trim() === '';

    let newText: string;
    let newCursorPos: number;

    if (isAtLineStart) {
      newText = description.slice(0, lineStart) + prefix + description.slice(lineStart);
      newCursorPos = lineStart + prefix.length;
    } else {
      newText = description.slice(0, start) + '\n' + prefix;
      if (start < description.length) {
        newText += description.slice(start);
      }
      newCursorPos = start + 1 + prefix.length;
    }

    setDescription(newText);
    setTimeout(() => {
      setSelection({ start: newCursorPos, end: newCursorPos });
      descriptionRef.current?.focus();
    }, 50);
  };

  const handleCancel = () => {
    if (title.trim() || description.trim()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Edit Note' : 'New Note'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="checkmark" size={22} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formInner}>
        {/* Date Input */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <View style={[styles.dateInputRow, { backgroundColor: colors.inputBg, borderColor: errors.date ? colors.danger : colors.border }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.dateInput, { color: colors.text }]}
              value={date}
              onChangeText={(t) => {
                setDate(t);
                if (errors.date) setErrors((e) => ({ ...e, date: undefined }));
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />
          </View>
          {errors.date ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors.date}</Text>
          ) : null}
        </View>

        {/* Title Input */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Title <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter note title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Description with Formatting Toolbar */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>

          {/* Formatting Toolbar */}
          <View style={[styles.toolbar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => insertLinePrefix('# ')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnText, { color: colors.text }]}>H1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => insertLinePrefix('## ')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnText, { color: colors.text }]}>H2</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => insertLinePrefix('### ')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnText, { color: colors.text }]}>H3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => insertFormatting('**', '**', 'bold text')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnTextBold, { color: colors.text }]}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => insertLinePrefix('- ')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnText, { color: colors.text }]}>{"\u2022"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => insertLinePrefix('1. ')}
              style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.toolbarBtnText, { color: colors.text }]}>1.</Text>
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <Text style={[styles.formatHint, { color: colors.textSecondary }]}>
            Use toolbar or type: **bold**, # Heading, - bullet, 1. numbered
          </Text>

          <TextInput
            ref={descriptionRef}
            style={[
              styles.textArea,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: errors.description ? colors.danger : colors.border,
              },
            ]}
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              if (errors.description) setErrors((e) => ({ ...e, description: undefined }));
            }}
            onSelectionChange={handleSelectionChange}
            selection={selection}
            placeholder={"Write your note here...\n\nUse the toolbar above to format text:\n# Heading 1\n## Heading 2\n**Bold text**\n- Bullet item\n1. Numbered item"}
            placeholderTextColor={colors.textSecondary}
            multiline
            textAlignVertical="top"
            scrollEnabled
          />
          {errors.description ? (
            <Text style={[styles.errorText, { color: colors.danger }]}>{errors.description}</Text>
          ) : null}
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
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  formInner: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  optional: {
    textTransform: 'none',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    marginBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  toolbarBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  toolbarBtnTextBold: {
    fontSize: 16,
    fontWeight: '900',
  },
  formatHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 350,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
});

export default NoteEditScreen;
