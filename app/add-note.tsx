import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Flag, Pill, Eye, MessageSquare, ImageIcon, Camera, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCare } from '@/providers/CareProvider';
import { useCarer } from '@/providers/CarerProvider';
import { NoteCategory, Note } from '@/constants/types';

const CATEGORIES: { label: NoteCategory; icon: typeof Flag; color: string }[] = [
  { label: 'Flag for Team', icon: Flag, color: Colors.noteFlag },
  { label: 'Meds Renewal', icon: Pill, color: Colors.noteMeds },
  { label: 'Pattern Noticed', icon: Eye, color: Colors.notePattern },
  { label: 'General', icon: MessageSquare, color: Colors.noteGeneral },
];

export default function AddNoteScreen() {
  const router = useRouter();
  const { addNote } = useCare();
  const { currentCarer } = useCarer();

  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | null>(null);
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[AddNote] Image picked from library:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('[AddNote] Error picking image:', error);
      Alert.alert('Error', 'Could not pick image. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('[AddNote] Photo taken:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log('[AddNote] Error taking photo:', error);
      Alert.alert('Error', 'Could not take photo. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Missing Info', 'Please write something for your note.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Info', 'Please select a category.');
      return;
    }
    if (!currentCarer) {
      Alert.alert('Not Logged In', 'Please log in before adding notes.');
      return;
    }

    const note: Note = {
      id: `n_${Date.now()}`,
      author: currentCarer.name,
      authorRole: currentCarer.role,
      date: new Date().toISOString().split('T')[0],
      category: selectedCategory,
      status: 'Ongoing',
      content: content.trim(),
      imageUri: imageUri ?? undefined,
    };

    addNote(note);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {!currentCarer && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                Please log in first to attach your name to notes.
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.warningLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(({ label, icon: Icon, color }) => {
              const isSelected = selectedCategory === label;
              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.categoryButton,
                    isSelected && { backgroundColor: color, borderColor: color },
                  ]}
                  onPress={() => {
                    setSelectedCategory(label);
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Icon size={22} color={isSelected ? Colors.white : color} />
                  <Text
                    style={[
                      styles.categoryLabel,
                      isSelected && { color: Colors.white },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Note</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Write your note here..."
            placeholderTextColor={Colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            testID="note-content"
          />

          <Text style={styles.sectionTitle}>Attach Photo</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handlePickImage}
              activeOpacity={0.7}
              testID="upload-image-button"
            >
              <ImageIcon size={22} color={Colors.primary} />
              <Text style={styles.mediaButtonText}>Upload Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
              testID="take-photo-button"
            >
              <Camera size={22} color={Colors.primary} />
              <Text style={styles.mediaButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={handleRemoveImage}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, (!selectedCategory || !content.trim()) && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!selectedCategory || !content.trim()}
            testID="save-note"
          >
            <Text style={styles.saveButtonText}>Save Note</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  warningBanner: {
    backgroundColor: Colors.warning + '20',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  warningLink: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: '44%' as unknown as number,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    minHeight: 140,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  previewContainer: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
