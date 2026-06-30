// ID generation utilities
/**
 * Generates a unique ID using crypto.randomUUID
 * Falls back to a custom implementation if crypto.randomUUID is not available
 */
export function generateId() {
    // Node.js 20+ has crypto.randomUUID built-in
    const cryptoLib = globalThis.crypto;
    if (cryptoLib && typeof cryptoLib.randomUUID === 'function') {
        return cryptoLib.randomUUID();
    }
    // Fallback implementation using getRandomValues
    const bytes = new Uint8Array(16);
    cryptoLib?.getRandomValues(bytes);
    // TypeScript's noUncheckedIndexedAccess requires us to handle undefined
    const byte6 = bytes[6] ?? 0;
    const byte8 = bytes[8] ?? 0;
    bytes[6] = (byte6 & 0x0f) | 0x40;
    bytes[8] = (byte8 & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-');
}
/**
 * Generates a short ID (8 characters)
 */
export function generateShortId() {
    const bytes = new Uint8Array(4);
    globalThis.crypto?.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Generates multiple unique IDs
 */
export function generateIds(count) {
    return Array.from({ length: count }, () => generateId());
}
/**
 * Validates if a string is a valid ID format
 */
export function isValidId(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
//# sourceMappingURL=id.utils.js.map