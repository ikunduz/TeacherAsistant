import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';

// Cache the encryption key to avoid repeated async calls
let cachedKey: string | null = null;

/**
 * React Native compatible base64 encoding
 * Converts a byte array to base64 string
 */
function bytesToBase64(bytes: number[]): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    const len = bytes.length;

    for (let i = 0; i < len; i += 3) {
        const b1 = bytes[i];
        const b2 = i + 1 < len ? bytes[i + 1] : 0;
        const b3 = i + 2 < len ? bytes[i + 2] : 0;

        result += chars[b1 >> 2];
        result += chars[((b1 & 3) << 4) | (b2 >> 4)];
        result += i + 1 < len ? chars[((b2 & 15) << 2) | (b3 >> 6)] : '=';
        result += i + 2 < len ? chars[b3 & 63] : '=';
    }

    return result;
}

/**
 * React Native compatible base64 decoding
 * Converts a base64 string to byte array
 */
function base64ToBytes(base64: string): number[] {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes: number[] = [];

    // Remove padding
    const cleanBase64 = base64.replace(/=/g, '');
    const len = cleanBase64.length;

    for (let i = 0; i < len; i += 4) {
        const c1 = chars.indexOf(cleanBase64[i]);
        const c2 = i + 1 < len ? chars.indexOf(cleanBase64[i + 1]) : 0;
        const c3 = i + 2 < len ? chars.indexOf(cleanBase64[i + 2]) : 0;
        const c4 = i + 3 < len ? chars.indexOf(cleanBase64[i + 3]) : 0;

        bytes.push((c1 << 2) | (c2 >> 4));
        if (i + 2 < len) bytes.push(((c2 & 15) << 4) | (c3 >> 2));
        if (i + 3 < len) bytes.push(((c3 & 3) << 6) | c4);
    }

    return bytes;
}

/**
 * Gets or creates the encryption key stored in secure hardware
 */
async function getEncryptionKey(): Promise<string> {
    // Return cached key if available
    if (cachedKey) return cachedKey;

    try {
        let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);

        if (!key) {
            // Generate a new 256-bit key
            key = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                Date.now().toString() + Math.random().toString()
            );
            await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
        }

        cachedKey = key;
        return key;
    } catch (error) {
        // Fallback for devices without secure storage (like Expo Go web)
        if (__DEV__) console.warn('SecureStore not available, using fallback key');
        // Use a consistent fallback key for development
        cachedKey = 'dev_fallback_key_for_expo_go_testing_1234567890';
        return cachedKey;
    }
}

/**
 * Simple XOR-based encryption (lightweight, sufficient for local data)
 */
export async function encryptData(data: string): Promise<string> {
    try {
        const key = await getEncryptionKey();
        const encrypted: number[] = [];

        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            encrypted.push(charCode ^ keyChar);
        }

        // Convert to base64 for safe storage
        return bytesToBase64(encrypted);
    } catch (error) {
        if (__DEV__) console.error('Encryption failed:', error);
        // Return as plain JSON in error case with a marker
        return 'PLAIN:' + data;
    }
}

/**
 * Decrypt data encrypted with encryptData
 */
export async function decryptData(encryptedData: string): Promise<string> {
    try {
        // Check for plain data fallback marker
        if (encryptedData.startsWith('PLAIN:')) {
            return encryptedData.substring(6);
        }

        const key = await getEncryptionKey();
        const encrypted = base64ToBytes(encryptedData);

        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const keyChar = key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(encrypted[i] ^ keyChar);
        }

        return decrypted;
    } catch (error) {
        if (__DEV__) console.error('Decryption failed:', error);
        throw error; // Re-throw to let caller handle
    }
}

/**
 * Check if data is encrypted (base64 check or PLAIN marker)
 */
export function isEncrypted(data: string): boolean {
    try {
        // Plain text fallback marker
        if (data.startsWith('PLAIN:')) return true;
        // Check if it looks like base64
        return /^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 20;
    } catch {
        return false;
    }
}

/**
 * Reset encryption key - useful for debugging
 */
export async function resetEncryptionKey(): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
        cachedKey = null;
        if (__DEV__) console.log('Encryption key reset');
    } catch (error) {
        if (__DEV__) console.warn('Failed to reset encryption key:', error);
    }
}
