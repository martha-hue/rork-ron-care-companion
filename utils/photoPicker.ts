import { Alert, ActionSheetIOS, Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PhotoPickerResult {
  uri: string;
  width: number;
  height: number;
}

async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();

  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(
      'Camera Access Needed',
      'It looks like camera access is turned off. To add a photo, you can enable it in your device Settings — it only takes a moment!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  }

  return false;
}

async function requestLibraryPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return true;
  }

  const mediaLibraryResponse = await ImagePicker.getMediaLibraryPermissionsAsync(false);
  if (mediaLibraryResponse.accessPrivileges === 'limited') {
    return true;
  }

  if (!canAskAgain) {
    Alert.alert(
      'Photo Library Access Needed',
      'It looks like photo library access is turned off. To choose a photo, you can enable it in your device Settings — it only takes a moment!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  }

  return false;
}

async function launchCamera(): Promise<PhotoPickerResult | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('[PhotoPicker] Camera photo taken:', result.assets[0].uri);
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
    }
  } catch (error) {
    console.error('[PhotoPicker] Camera error:', error);
    Alert.alert('Oops', 'Something went wrong while taking the photo. Please try again.');
  }

  return null;
}

async function launchLibrary(): Promise<PhotoPickerResult | null> {
  const hasPermission = await requestLibraryPermission();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      console.log('[PhotoPicker] Library photo selected:', result.assets[0].uri);
      return {
        uri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
    }
  } catch (error) {
    console.error('[PhotoPicker] Library error:', error);
    Alert.alert('Oops', 'Something went wrong while selecting the photo. Please try again.');
  }

  return null;
}

export function showPhotoPicker(onResult: (result: PhotoPickerResult) => void): void {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Take a Photo', 'Choose from Library'],
        cancelButtonIndex: 0,
        title: 'Add Photo',
      },
      async (buttonIndex) => {
        let result: PhotoPickerResult | null = null;
        if (buttonIndex === 1) {
          result = await launchCamera();
        } else if (buttonIndex === 2) {
          result = await launchLibrary();
        }
        if (result) {
          onResult(result);
        }
      }
    );
  } else {
    Alert.alert(
      'Add Photo',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take a Photo',
          onPress: async () => {
            const result = await launchCamera();
            if (result) onResult(result);
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const result = await launchLibrary();
            if (result) onResult(result);
          },
        },
      ]
    );
  }
}
