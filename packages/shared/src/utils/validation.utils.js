// Validation utility functions
/**
 * Validates if a string is a valid UUID v4
 */
export function validateUUID(value) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
}
/**
 * Validates if a string is a valid email
 */
export function validateEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}
/**
 * Validates if a value is within a range
 */
export function validateRange(value, min, max) {
    return value >= min && value <= max;
}
/**
 * Validates if a string is not empty
 */
export function validateNonEmpty(value) {
    return value !== null && value !== undefined && value.trim().length > 0;
}
/**
 * Validates if a string matches a maximum length
 */
export function validateMaxLength(value, maxLength) {
    return value.length <= maxLength;
}
/**
 * Validates if a value is a valid integer
 */
export function validateInteger(value) {
    return Number.isInteger(value);
}
/**
 * Validates if a value is a positive number
 */
export function validatePositiveNumber(value) {
    return typeof value === 'number' && value > 0;
}
/**
 * Validates if a position object is valid
 */
export function validatePosition(position) {
    if (typeof position !== 'object' || position === null) {
        return false;
    }
    const pos = position;
    return (typeof pos.x === 'number' &&
        typeof pos.y === 'number' &&
        Number.isFinite(pos.x) &&
        Number.isFinite(pos.y));
}
/**
 * Sanitizes a string input
 */
export function sanitizeString(value) {
    return value.trim().replace(/[<>]/g, '');
}
/**
 * Validates agent name
 */
export function validateAgentName(name) {
    return (validateNonEmpty(name) &&
        validateMaxLength(name, 100) &&
        /^[a-zA-Z0-9_-]+$/.test(name));
}
/**
 * Validates workspace dimensions
 */
export function validateDimensions(width, height, min, max) {
    return (validateInteger(width) &&
        validateInteger(height) &&
        validateRange(width, min, max) &&
        validateRange(height, min, max));
}
//# sourceMappingURL=validation.utils.js.map