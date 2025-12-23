/**
 * Sanitize text input to prevent XSS and limit length
 */
export function sanitizeText(input: string, maxLength = 200): string {
    if (!input) return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential XSS characters
        .substring(0, maxLength);
}

/**
 * Sanitize and parse numeric input
 */
export function sanitizeNumber(input: string): number {
    if (!input) return 0;

    const parsed = parseFloat(input.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : Math.max(0, parsed); // Ensure non-negative
}

/**
 * Sanitize phone number (Turkish format)
 */
export function sanitizePhone(input: string): string {
    if (!input) return '';

    return input
        .replace(/[^\d]/g, '') // Only digits
        .substring(0, 15); // Max phone length
}

/**
 * Validate and sanitize data before storage
 */
export function sanitizeStorageData(data: any): any {
    if (!data) return data;

    // For objects/arrays, recursively sanitize string values
    if (typeof data === 'object') {
        if (Array.isArray(data)) {
            return data.map(item => sanitizeStorageData(item));
        }

        const sanitized: any = {};
        for (const key in data) {
            const value = data[key];
            if (typeof value === 'string') {
                sanitized[key] = sanitizeText(value, 1000); // Max 1000 chars per field
            } else {
                sanitized[key] = sanitizeStorageData(value);
            }
        }
        return sanitized;
    }

    return data;
}
