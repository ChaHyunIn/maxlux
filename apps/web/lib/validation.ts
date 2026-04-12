export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates if a string is a valid email address.
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}

/**
 * Validates if a string is a valid UUID (v4/v1).
 */
export function isValidUUID(str: string): boolean {
    return UUID_REGEX.test(str);
}

/**
 * Validates if a string matches YYYY-MM-DD format.
 */
export function isValidDateString(str: string): boolean {
    return DATE_REGEX.test(str);
}
