/**
 * Generates a unique ID using crypto.randomUUID
 * Falls back to a custom implementation if crypto.randomUUID is not available
 */
export declare function generateId(): string;
/**
 * Generates a short ID (8 characters)
 */
export declare function generateShortId(): string;
/**
 * Generates multiple unique IDs
 */
export declare function generateIds(count: number): string[];
/**
 * Validates if a string is a valid ID format
 */
export declare function isValidId(id: string): boolean;
//# sourceMappingURL=id.utils.d.ts.map