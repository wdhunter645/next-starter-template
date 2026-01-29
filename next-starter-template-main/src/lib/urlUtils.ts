/**
 * Validates that a URL path is safe for internal navigation.
 * Returns the path if safe, otherwise returns the fallback.
 * 
 * Safe path requirements:
 * - Must start with `/`
 * - Must not contain `http://`, `https://`, or `//`
 * 
 * @param path - The path to validate
 * @param fallback - The fallback path if validation fails (default: '/')
 * @returns The validated path or fallback
 */
export function validateInternalPath(path: string | null | undefined, fallback = '/'): string {
  if (!path || typeof path !== 'string') {
    return fallback;
  }

  const trimmed = path.trim();

  // Must start with /
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  // Must not contain http://, https://, or //
  if (
    trimmed.includes('http://') ||
    trimmed.includes('https://') ||
    trimmed.includes('//')
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Gets the current path for use in the `from` parameter.
 * Returns the pathname from window.location if available, otherwise fallback.
 * 
 * @param fallback - The fallback path (default: '/')
 * @returns The current path
 */
export function getCurrentPath(fallback = '/'): string {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return window.location.pathname || fallback;
}

/**
 * Validates an email address using a simple but effective regex pattern.
 * 
 * @param email - The email address to validate
 * @returns true if the email is valid, false otherwise
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmed = email.trim();
  
  // Simple but effective email validation
  // Ensures: something@something.something
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}
