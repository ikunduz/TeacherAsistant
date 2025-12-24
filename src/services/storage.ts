import AsyncStorage from '@react-native-async-storage/async-storage';
import { Group, Lesson, Payment, Student, Teacher } from '../types';
import { sanitizeStorageData } from '../utils/validation';
import { decryptData, encryptData, isEncrypted } from './encryption';

const KEYS = {
  TEACHER: '@teacher',
  STUDENTS: '@students',
  LESSONS: '@lessons',
  PAYMENTS: '@payments',
  GROUPS: '@groups',
  ENCRYPTED_FLAG: '@encrypted_v1', // Flag to track migration
  SETTINGS: '@settings',
};

/**
 * Save data with encryption
 */
async function saveEncrypted(key: string, data: any): Promise<void> {
  try {
    const sanitized = sanitizeStorageData(data);
    const jsonString = JSON.stringify(sanitized);
    const encrypted = await encryptData(jsonString);
    await AsyncStorage.setItem(key, encrypted);
  } catch (error) {
    if (__DEV__) console.error(`Save failed for ${key}:`, error);
    throw error;
  }
}

/**
 * Get data with decryption and auto-migration
 */
async function getEncrypted<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    if (!data) return defaultValue;

    // Check if data needs migration (plaintext to encrypted)
    const needsMigration = !isEncrypted(data);

    if (needsMigration) {
      // Data is plaintext, try to parse it
      try {
        if (__DEV__) console.log(`Migrating ${key} to encrypted storage`);
        const parsed = JSON.parse(data);
        await saveEncrypted(key, parsed); // Re-save encrypted
        return parsed;
      } catch (parseError) {
        // Plaintext data is corrupted, reset to default
        if (__DEV__) console.warn(`Corrupted plaintext data for ${key}, resetting to default`);
        await AsyncStorage.removeItem(key);
        return defaultValue;
      }
    }

    // Data is already encrypted, decrypt it
    try {
      const decrypted = await decryptData(data);
      return JSON.parse(decrypted);
    } catch (decryptError) {
      // Decryption or parse failed, data is corrupted
      if (__DEV__) console.warn(`Failed to decrypt/parse ${key}, resetting to default:`, decryptError);
      await AsyncStorage.removeItem(key);
      return defaultValue;
    }
  } catch (error) {
    if (__DEV__) console.error(`Get failed for ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Check and complete migration if needed
 */
async function ensureMigration(): Promise<void> {
  try {
    const isMigrated = await AsyncStorage.getItem(KEYS.ENCRYPTED_FLAG);
    if (isMigrated) return; // Already migrated

    // Trigger read of all keys to auto-migrate
    await Promise.all([
      getEncrypted(KEYS.TEACHER, null),
      getEncrypted(KEYS.STUDENTS, []),
      getEncrypted(KEYS.LESSONS, []),
      getEncrypted(KEYS.PAYMENTS, []),
      getEncrypted(KEYS.GROUPS, []),
      getEncrypted(KEYS.SETTINGS, null),
    ]);

    // Mark as migrated
    await AsyncStorage.setItem(KEYS.ENCRYPTED_FLAG, 'true');
    if (__DEV__) console.log('Migration completed');
  } catch (error) {
    if (__DEV__) console.error('Migration failed:', error);
  }
}

// Run migration check on module load
ensureMigration();

export const StorageService = {
  async saveTeacher(data: Teacher) {
    await saveEncrypted(KEYS.TEACHER, data);
  },

  async getTeacher(): Promise<Teacher | null> {
    return await getEncrypted<Teacher | null>(KEYS.TEACHER, null);
  },

  async saveStudents(data: Student[]) {
    await saveEncrypted(KEYS.STUDENTS, data);
  },

  async getStudents(): Promise<Student[]> {
    return await getEncrypted<Student[]>(KEYS.STUDENTS, []);
  },

  async saveGroups(data: Group[]) {
    await saveEncrypted(KEYS.GROUPS, data);
  },

  async getGroups(): Promise<Group[]> {
    return await getEncrypted<Group[]>(KEYS.GROUPS, []);
  },

  async saveLessons(data: Lesson[]) {
    await saveEncrypted(KEYS.LESSONS, data);
  },

  async getLessons(): Promise<Lesson[]> {
    return await getEncrypted<Lesson[]>(KEYS.LESSONS, []);
  },

  async savePayments(data: Payment[]) {
    await saveEncrypted(KEYS.PAYMENTS, data);
  },

  async getPayments(): Promise<Payment[]> {
    return await getEncrypted<Payment[]>(KEYS.PAYMENTS, []);
  },

  async saveSettings(data: any) {
    await saveEncrypted(KEYS.SETTINGS, data);
  },

  async getSettings(): Promise<any | null> {
    return await getEncrypted<any | null>(KEYS.SETTINGS, null);
  },

  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(KEYS.TEACHER),
        AsyncStorage.removeItem(KEYS.STUDENTS),
        AsyncStorage.removeItem(KEYS.LESSONS),
        AsyncStorage.removeItem(KEYS.PAYMENTS),
        AsyncStorage.removeItem(KEYS.GROUPS),
        AsyncStorage.removeItem(KEYS.SETTINGS),
        AsyncStorage.removeItem(KEYS.ENCRYPTED_FLAG),
      ]);
      if (__DEV__) console.log('All data cleared successfully');
    } catch (error) {
      if (__DEV__) console.error('Failed to clear all data:', error);
      throw error;
    }
  },
};