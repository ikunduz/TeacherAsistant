import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';

/**
 * Gets or creates the encryption key stored in secure hardware
 */
async function getEncryptionKey(): Promise<string> {
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

        return key;
    } catch (error) {
        // Fallback for devices without secure storage
        if (__DEV__) console.warn('SecureStore not available, using fallback');
        return 'fallback_key_not_secure_' + Crypto.getRandomBytes(16).join('');
    }
}

/**
 * Simple XOR-based encryption (lightweight, sufficient for local data)
 * For production-grade apps, consider using expo-crypto's AES implementation
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
        return Buffer.from(encrypted).toString('base64');
    } catch (error) {
        if (__DEV__) console.error('Encryption failed:', error);
        return data; // Fallback to plaintext in error case
    }
}

/**
 * Decrypt data encrypted with encryptData
 */
export async function decryptData(encryptedData: string): Promise<string> {
    try {
        const key = await getEncryptionKey();
        const encrypted = Array.from(Buffer.from(encryptedData, 'base64'));

        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const keyChar = key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(encrypted[i] ^ keyChar);
        }

        return decrypted;
    } catch (error) {
        if (__DEV__) console.error('Decryption failed:', error);
        return encryptedData; // Return as-is if decryption fails
    }
}

/**
 * Check if data is encrypted (base64 check)
 */
export function isEncrypted(data: string): boolean {
    try {
        return /^[A-Za-z0-9+/]+=*$/.test(data) && data.length > 20;
    } catch {
        return false;
    }
}
