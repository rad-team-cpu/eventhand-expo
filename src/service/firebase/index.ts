import { initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  UploadResult,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { ImageInfo } from 'types/types';

// Initialize Firebase
class FirebaseService {
  private static instance: FirebaseService | null;
  private storage: FirebaseStorage;

  private constructor() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    const firebaseApp = initializeApp(firebaseConfig);

    // Initialize Firebase Storage
    this.storage = getStorage(firebaseApp);
  }

  static getInstance() {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async uploadFile(fileName: string, fileUri: string) {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      // const fileName = `images/${Date.now()}`; // Unique file name

      const fileRef = ref(this.storage, fileName);
      const result = await uploadBytes(fileRef, blob);

      return result; // Return the file path or URL for further use
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async uploadProfileAvatar(
    userId: string,
    image: ImageInfo,
    userType: 'Client' | 'Vendor' | undefined = 'Client'
  ): Promise<UploadResult | undefined> {
    let fileName: string = '';

    if (!image.uri || image.uri == '') {
      throw new Error('Invalid Uri');
    }

    if (userType === 'Vendor') {
      fileName = `images/${userId}/profile/vendor/logo.${image.fileExtension}`;
    }

    if (userType === 'Client') {
      fileName = `images/${userId}/profile/avatar.${image.fileExtension}`;
    }

    const result = await this.uploadFile(fileName, image.uri);

    return result;
  }

  async uploadID(
    vendorId: string,
    image: ImageInfo
  ): Promise<UploadResult | undefined> {
    let fileName: string = '';

    if (!image.uri || image.uri == '') {
      throw new Error('Invalid Uri');
    }

    fileName = `images/${vendorId}/profile/vendor/credentials.${image.fileExtension}`;

    const result = await this.uploadFile(fileName, image.uri);

    return result;
  }

  async uploadMessageImage(
    chatId: string,
    messageId: string,
    image: ImageInfo
  ) {
    if (!image.uri || image.uri == '') {
      throw new Error('Invalid Uri');
    }

    const fileName = `images/chat/${chatId}/${messageId}.${image.fileExtension}`;

    const result = await this.uploadFile(fileName, image.uri);

    return result;
  }

  async getProfilePicture(path: string) {
    const profilePictureRef = ref(this.storage, path);
    try {
      const profileAvatarUrl = await getDownloadURL(profilePictureRef);
      return profileAvatarUrl;
    } catch (error: any) {
      throw error;
    }
  }
}

export default FirebaseService;

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
