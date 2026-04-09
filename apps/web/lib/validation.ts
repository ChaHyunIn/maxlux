const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates whether a given string is a correctly formatted email address.
 */
export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email);
}
