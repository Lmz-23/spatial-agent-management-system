/**
 * Validates if a string is a valid UUID v4
 */
export declare function validateUUID(value: string): boolean;
/**
 * Validates if a string is a valid email
 */
export declare function validateEmail(value: string): boolean;
/**
 * Validates if a value is within a range
 */
export declare function validateRange(value: number, min: number, max: number): boolean;
/**
 * Validates if a string is not empty
 */
export declare function validateNonEmpty(value: string | null | undefined): boolean;
/**
 * Validates if a string matches a maximum length
 */
export declare function validateMaxLength(value: string, maxLength: number): boolean;
/**
 * Validates if a value is a valid integer
 */
export declare function validateInteger(value: unknown): boolean;
/**
 * Validates if a value is a positive number
 */
export declare function validatePositiveNumber(value: number): boolean;
/**
 * Validates if a position object is valid
 */
export declare function validatePosition(position: unknown): position is {
    x: number;
    y: number;
};
/**
 * Sanitizes a string input
 */
export declare function sanitizeString(value: string): string;
/**
 * Validates agent name
 */
export declare function validateAgentName(name: string): boolean;
/**
 * Validates workspace dimensions
 */
export declare function validateDimensions(width: number, height: number, min: number, max: number): boolean;
//# sourceMappingURL=validation.utils.d.ts.map