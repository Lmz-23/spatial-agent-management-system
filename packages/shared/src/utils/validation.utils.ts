// Validation utility functions

/**
 * Validates if a string is a valid UUID v4
 */
export function validateUUID(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates if a string is a valid email
 */
export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validates if a value is within a range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
): boolean {
  return value >= min && value <= max;
}

/**
 * Validates if a string is not empty
 */
export function validateNonEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validates if a string matches a maximum length
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
): boolean {
  return value.length <= maxLength;
}

/**
 * Validates if a value is a valid integer
 */
export function validateInteger(value: unknown): boolean {
  return Number.isInteger(value);
}

/**
 * Validates if a value is a positive number
 */
export function validatePositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * Validates if a position object is valid
 */
export function validatePosition(
  position: unknown,
): position is { x: number; y: number } {
  if (typeof position !== 'object' || position === null) {
    return false;
  }
  const pos = position as Record<string, unknown>;
  return (
    typeof pos.x === 'number' &&
    typeof pos.y === 'number' &&
    Number.isFinite(pos.x) &&
    Number.isFinite(pos.y)
  );
}

/**
 * Sanitizes a string input
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/[<>]/g, '');
}

/**
 * Validates agent name
 */
export function validateAgentName(name: string): boolean {
  return (
    validateNonEmpty(name) &&
    validateMaxLength(name, 100) &&
    /^[a-zA-Z0-9_-]+$/.test(name)
  );
}

/**
 * Validates workspace dimensions
 */
export function validateDimensions(
  width: number,
  height: number,
  min: number,
  max: number,
): boolean {
  return (
    validateInteger(width) &&
    validateInteger(height) &&
    validateRange(width, min, max) &&
    validateRange(height, min, max)
  );
}
